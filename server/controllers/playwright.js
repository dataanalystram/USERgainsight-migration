const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: false }); // Run with UI
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Go to login page
    console.log("🌐 Navigating to login page...");
    await page.goto("https://vznconnect.gainsightcloud.com");

    // 2. Wait and fill login
    console.log("📝 Filling login credentials...");
    await page.waitForSelector('input[name="username"]', { timeout: 30000 });
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.fill('input[name="username"]', "sugandha.joshi@wigmoreit.com");
    await page.fill('input[name="password"]', "ToGainSight@14");

    // 3. Submit and wait for redirect
    console.log("🔐 Submitting login...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.keyboard.press("Enter"),
    ]);

    // 4. Check login result
    if (page.url().includes("dashboard") || page.url().includes("home")) {
      console.log("✅ Login successful!\n");

      // 4.a Navigate to User Management
      console.log("➡️ Navigating to User Management page...");
      await page.goto(
        "https://vznconnect.gainsightcloud.com/v1/ui/usermanagement#/users",
        {
          waitUntil: "networkidle",
        },
      );
      console.log("📋 User Management page loaded successfully");

      async function logoutImpersonatedUser(page) {
        console.log("🔄 Attempting logout in the new tab (newPage)...");
        try {
          // Click the user profile/dropdown button
          console.log(
            "🖱️ Clicking user profile/dropdown button to open logout menu on new page...",
          );
          const userProfileButtonSelector =
            "header > nav > ul > li:nth-child(3)";
          try {
            await page.waitForSelector(userProfileButtonSelector, {
              state: "visible",
              timeout: 15000,
            });
            await page.click(userProfileButtonSelector);
          } catch (e) {
            console.error(
              `❌ Failed to click user profile button: ${e.message}`,
            );
            await page.screenshot({
              path: `logout_error_profile_button_${Date.now()}.png`,
            });
            throw new Error("Could not click user profile button for logout.");
          }

          // Wait for the dropdown to appear and click the logout link
          console.log("🔍 Looking for logout link in dropdown on new page...");
          const logoutLinkSelector =
            "#cdk-overlay-2 > div > ul > li.user-popover-menu-item.ant-dropdown-menu-item.ng-star-inserted > a";
          try {
            await page.waitForSelector(logoutLinkSelector, {
              state: "visible",
              timeout: 15000,
            });
            await page.click(logoutLinkSelector);
            await page.screenshot({
              path: `logout_button_clicked_${Date.now()}.png`,
            });
            console.log("📸 Screenshot after clicking logout button saved.");
            console.log("✅ Clicked logout link in dropdown on new page.");
          } catch (e) {
            console.error(`❌ Failed to click logout link: ${e.message}`);
            await page.screenshot({
              path: `logout_error_logout_link_${Date.now()}.png`,
            });
            throw new Error("Could not click logout link.");
          }

          // Wait for navigation after clicking logout
          console.log("⏳ Waiting for navigation after logout click...");
          try {
            await page.waitForNavigation({
              waitUntil: "networkidle",
              timeout: 20000,
            });
            console.log("✅ Navigation after logout completed.");
          } catch (e) {
            console.warn(
              `⚠️ Navigation after logout timed out or failed: ${e.message}. Proceeding...`,
            );
          }

          // Optional: Wait for logout to complete (banner disappears)
          console.log('🔍 Waiting for "Logged in as" banner to disappear...');
          try {
            await page.waitForSelector("text=Logged in as", {
              state: "hidden",
              timeout: 10000,
            });
            console.log(
              '✅ "Logged in as" banner disappeared. Logout successful.',
            );
          } catch (e) {
            console.warn(
              `⚠️ "Logged in as" banner did not disappear: ${e.message}. Logout might not be complete.`,
            );
          }

          console.log("Successfully logged out of impersonated session");
        } catch (error) {
          console.error(
            `❌ Failed to logout from impersonated session: ${error.message}`,
          );
          await page.screenshot({ path: `logout_error_${Date.now()}.png` });
          console.log("📸 Error screenshot during logout saved.");
          throw error; // Re-throw to propagate the error to loginAsUser
        }
      }

      // 5. Function to login as a specific user using search
      const loginAsUser = async (targetEmail) => {
        console.log(`🔍 Searching for user with email: ${targetEmail}`);
        try {
          const searchInput = page.locator(
            'input.px-search.ant-input[placeholder="Name or Email"]',
          );
          await searchInput.waitFor({ timeout: 10000 });
          await searchInput.clear();
          await searchInput.fill(targetEmail);
          console.log(`📝 Entered "${targetEmail}" in search box`);
          await searchInput.press("Enter");
          console.log("⌨️ Pressed Enter to trigger search");
          await page.waitForTimeout(2000);

          console.log("🔍 Looking for three dots menu...");
          const threeDotSelectors = [
            'svg[data-icon="more-vertical"]',
            'svg[viewBox="0 0 24 24"]:has(path[d*="M12 15.5a1.5 1.5 0 110 3"])',
            '[data-icon="more-vertical"]',
            'button:has(svg[data-icon="more-vertical"])',
            '.ant-dropdown-trigger:has(svg[data-icon="more-vertical"])',
          ];

          let threeDotButton = null;
          for (const selector of threeDotSelectors) {
            try {
              threeDotButton = page.locator(selector).first();
              if (await threeDotButton.isVisible({ timeout: 2000 })) {
                console.log(
                  `✅ Found three dots menu with selector: ${selector}`,
                );
                break;
              }
            } catch (e) {
              continue;
            }
          }

          if (!threeDotButton || !(await threeDotButton.isVisible())) {
            threeDotButton = page
              .locator(`tr:has-text("${targetEmail}") svg[viewBox="0 0 24 24"]`)
              .first();
            if (await threeDotButton.isVisible({ timeout: 2000 })) {
              console.log("✅ Found three dots menu using fallback selector");
            } else {
              throw new Error("Three dots menu not found");
            }
          }

          console.log("🖱️ Clicking on three dots menu...");
          await threeDotButton.click();
          await page.waitForTimeout(1000);

          console.log('🔍 Looking for "Login as User" option...');
          const loginMenuSelectors = [
            'li.ant-menu-item:has-text("Login as User")',
            'li[nz-menu-item]:has-text("Login as User")',
            '.ant-menu-item:has-text("Login as User")',
            '[nz-menu-item]:has-text("Login as User")',
            'li:has-text("Login as User")',
          ];

          let loginMenuItem = null;
          for (const selector of loginMenuSelectors) {
            try {
              loginMenuItem = page.locator(selector);
              if (await loginMenuItem.isVisible({ timeout: 2000 })) {
                console.log(
                  `✅ Found "Login as User" menu item with selector: ${selector}`,
                );
                break;
              }
            } catch (e) {
              continue;
            }
          }

          if (!loginMenuItem || !(await loginMenuItem.isVisible())) {
            throw new Error('"Login as User" menu item not found');
          }

          console.log('🖱️ Clicking on "Login as User"...');
          const pagePromise = context.waitForEvent("page");
          await loginMenuItem.click();
          const newPage = await pagePromise;

          console.log("⏳ Waiting for user login to complete in new tab...");
          await newPage.waitForLoadState("networkidle");
          const currentUrl = newPage.url();
          console.log(
            `📍 Current URL in new tab after login attempt: ${currentUrl}`,
          );
      };

      // 6. Specify the emails of the users you want to login as
      const targetUserEmails = [
        { Email: "monica.galan.pulido@movildata.com" },
        { Email: "monica.pezzi@verizonconnect.com" },
        { Email: "monica.yanni.bautista@verizonconnect.com" },
        { Email: "monika.legan@verizonconnect.com" },
        { Email: "monique.smith@verizonconnect.com" },
        { Email: "monique.van.gulik@verizonconnect.com" },
        { Email: "morgan.adams@verizonconnect.com" },
        { Email: "mylene.suazo@verizonconnect.com" },
        { Email: "nadeem.hadaf@verizonconnect.com" },
        { Email: "nasir.osman@verizonconnect.com" },
        { Email: "natalie.lebron@verizonconnect.com" },
        { Email: "natarsha.walter@verizonconnect.com" },
        { Email: "natasha.wright@verizonconnect.com" },
        { Email: "nathan.logan@verizonconnect.com" },
        { Email: "natoshua.kamara@verizonconnect.com" },
        { Email: "navya.narasimhappa@verizonconnect.com" },
        { Email: "neal.behrman@verizonconnect.com" },
        { Email: "nediriza.bacalla@verizonconnect.com" },
        { Email: "nelsa.napoles@verizonconnect.com" },
        { Email: "nelson.duong@verizonconnect.com" },
        { Email: "nicholas.carrington@verizonconnect.com" },
        { Email: "nicholas.waters@verizonconnect.com" },
        { Email: "nicholas.yanez@verizonconnect.com" },
        { Email: "nicole.fininis@verizonconnect.com" },
        { Email: "nicole.ortiz.cameron@verizonconnect.com" },
        { Email: "nicole.ramsey@verizonconnect.com" },
        { Email: "nigel.tocher@verizonconnect.com" },
        { Email: "nikolas.reyes@verizonconnect.com" },
        { Email: "noe.garcia@verizonconnect.com" },
        { Email: "noel.madrigal@verizonconnect.com" },
        { Email: "no-reply@gainsightapp.com" },
        { Email: "oliver.rafou@verizonconnect.com" },
        { Email: "omar.zavala@verizonconnect.com" },
        { Email: "onochie.ani@verizonconnect.com" },
        { Email: "orlando.valdoz@verizonconnect.com" },
        { Email: "oscar.ceballos1@verizonconnect.com" },
        { Email: "pablo.rosillo.castro@movildata.com" },
        { Email: "paloma.mora.pina@verizonconnect.com" },
        { Email: "pamela.colorado.silva@verizonconnect.com" },
        { Email: "pamela.velez@verizonconnect.com" },
        { Email: "panna.matyas@verizonconnect.com" },
        { Email: "patrick.nolan@verizonconnect.com" },
        { Email: "patrick.quinto@verizonconnect.com" },
        { Email: "patrick.ryan@verizonconnect.com" },
        { Email: "patrycja.szczyrbak@verizonconnect.com" },
        { Email: "patty.york@verizonconnect.com" },
        { Email: "paul.bauman@verizonconnect.com" },
        { Email: "paulette.rhymaun@verizonconnect.com" },
        { Email: "paul.hudson@verizonconnect.com" },
        { Email: "paul.kelly@verizonconnect.com" },
        { Email: "paul.matthis@verizonconnect.com" },
        { Email: "paul.sorensen@verizonconnect.com" },
        { Email: "pedro.moreno@verizonconnect.com" },
        { Email: "per.akerstrom@verizonconnect.com" },
        { Email: "perrine.rossi@verizonconnect.com" },
        { Email: "peter.jaskot@verizonconnect.com" },
        { Email: "peter.platten@verizonconnect.com" },
        { Email: "phil.kutz@verizonconnect.com" },
        { Email: "phil.sachs@verizonconnect.com" },
        { Email: "piroska.egedy@verizonconnect.com" },
        { Email: "prichie.lampunay@verizonconnect.com" },
        { Email: "princess.joy.bico@verizonconnect.com" },
        { Email: "princess.sims@verizonconnect.com" },
        { Email: "pstewart@verizonconnect.com" },
        { Email: "quentin.boyd.wiley@verizonconnect.com" },
        { Email: "quinnton.duenez@verizonconnect.com" },
        { Email: "rachael.capizzano@verizonconnect.com" },
        { Email: "rachel.aleliunas@verizonconnect.com" },
      ];

      let completedUsers = 0;
      const totalUsers = targetUserEmails.length;

      for (const user of targetUserEmails) {
        const targetUserEmail = user.Email;

        // Clear the search input on the main page before searching for the next user
        console.log(
          `🔄 Clearing search input on main page for next user: ${targetUserEmail}`,
        );
        const searchInput = page.locator(
          'input.px-search.ant-input[placeholder="Name or Email"]',
        );
        await searchInput.waitFor({ timeout: 10000 });
        await searchInput.clear();
        await searchInput.press("Enter"); // Trigger search with empty input to clear results
        await page.waitForLoadState("networkidle"); // Wait for the page to settle after clearing search
        await page.waitForTimeout(1000); // Small delay to ensure UI updates

        const loginSuccess = await loginAsUser(targetUserEmail);

        if (loginSuccess) {
          console.log(
            `✅ Successfully logged in and out as user: ${targetUserEmail}`,
          );
        } else {
          console.log(`❌ Failed to login as user: ${targetUserEmail}`);
        }
        completedUsers++;
        console.log(`
Progress: ${completedUsers}/${totalUsers} users completed. Remaining: ${totalUsers - completedUsers}`);
      }
    } else {
      console.warn("⚠️ Login may have failed. Current URL:", page.url());
    }
  } catch (error) {
    console.error("❌ Script failed:", error.message);
