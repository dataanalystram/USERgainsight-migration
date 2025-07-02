const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Run with UI
  const context = await browser.newContext();
    let page = await context.newPage();

  const getCookiesAfterLoginAsUser = async () => {
    console.log('🍪 Extracting cookies from browser storage...');
    const domainCookies = await context.cookies('https://vznconnect.gainsightcloud.com');
    return domainCookies;
  };

  const formatCookiesForAPI = (cookies) => {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  };

  try {
    // Login as admin
    console.log('🌐 Navigating to login page...');
    await page.goto('https://vznconnect.gainsightcloud.com');

    console.log('📝 Filling login credentials...');
    await page.waitForSelector('input[type="email"], input[name="username"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="username"]', 'sugandha.joshi@wigmoreit.com');
    await page.fill('input[type="password"]', 'ToGainSight@14');

    console.log('🔐 Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.keyboard.press('Enter')
    ]);

    if (page.url().includes('dashboard') || page.url().includes('home')) {
      console.log('✅ Login successful!\n');

      console.log('➡️ Navigating to User Management page...');
      await page.goto('https://vznconnect.gainsightcloud.com/v1/ui/usermanagement#/users', {
        waitUntil: 'networkidle'
      });
      console.log('📋 User Management page loaded successfully');

      const loginAsUser = async (targetEmail, page) => {
        console.log(`🔍 Searching for user with email: ${targetEmail}`);

        try {
          const searchInput = page.locator('input.px-search.ant-input[placeholder="Name or Email"]');
          await searchInput.waitFor({ timeout: 10000 });

          await searchInput.clear();
          await searchInput.fill(targetEmail);
          console.log(`📝 Entered "${targetEmail}" in search box`);
          await searchInput.press('Enter');
          console.log('⌨️ Pressed Enter to trigger search');
          await page.waitForTimeout(2000);

          console.log('🔍 Looking for three dots menu...');
          const threeDotSelectors = [
            'svg[data-icon="more-vertical"]',
            'svg[viewBox="0 0 24 24"]:has(path[d*="M12 15.5a1.5 1.5 0 110 3"])',
            '[data-icon="more-vertical"]',
            'button:has(svg[data-icon="more-vertical"])',
            '.ant-dropdown-trigger:has(svg[data-icon="more-vertical"])'
          ];

          let threeDotButton = null;
          for (const selector of threeDotSelectors) {
            try {
              threeDotButton = page.locator(selector).first();
              if (await threeDotButton.isVisible({ timeout: 2000 })) {
                console.log(`✅ Found three dots menu with selector: ${selector}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }

          if (!threeDotButton || !(await threeDotButton.isVisible())) {
            threeDotButton = page.locator(`tr:has-text("${targetEmail}") svg[viewBox="0 0 24 24"]`).first();
            if (await threeDotButton.isVisible({ timeout: 2000 })) {
              console.log('✅ Found three dots menu using fallback selector');
            } else {
              throw new Error('Three dots menu not found');
            }
          }

          console.log('🖱️ Clicking on three dots menu...');
          await threeDotButton.click();
          await page.waitForTimeout(1000);

          console.log('🔍 Looking for "Login as User" option...');
          const loginMenuSelectors = [
            'li.ant-menu-item:has-text("Login as User")',
            'li[nz-menu-item]:has-text("Login as User")',
            '.ant-menu-item:has-text("Login as User")',
            '[nz-menu-item]:has-text("Login as User")',
            'li:has-text("Login as User")'
          ];

          let loginMenuItem = null;
          for (const selector of loginMenuSelectors) {
            try {
              loginMenuItem = page.locator(selector);
              if (await loginMenuItem.isVisible({ timeout: 2000 })) {
                console.log(`✅ Found "Login as User" menu item with selector: ${selector}`);
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
          await loginMenuItem.click();
          await page.waitForTimeout(5000);
          await page.waitForLoadState('networkidle');
          const currentUrl = page.url();
          console.log(`📍 Current URL after login attempt: ${currentUrl}`);
          return true;

        } catch (error) {
          console.error(`❌ Error in loginAsUser function:`, error.message);
          await page.screenshot({ path: `login_error_${Date.now()}.png` });
          console.log('📸 Error screenshot saved');
          return false;
        }
      };

      // List of user emails to impersonate
      let a = [
        {
          "Email": "aaron.hallett@verizonconnect.com"
        },
        {
          "Email": "aaron.lopez@verizonconnect.com"
        },
        {
          "Email": "aaron.martinez@verizonconnect.com"
        },
        {
          "Email": "abraham.ghantous@verizonconnect.com"
        },
        {
          "Email": "abraham.valdez@verizonconnect.com"
        },
        {
          "Email": "abram.perez@verizonconnect.com"
        },
        {
          "Email": "adam.crawford@verizonconnect.com"
        },
        {
          "Email": "adam.rose@verizonconnect.com"
        },
        {
          "Email": "adria.defazio@verizonconnect.com"
        },
        {
          "Email": "adrian.rodriguez1@verizonconnect.com"
        },
        {
          "Email": "agata.kolenda@verizonconnect.com"
        },
        {
          "Email": "agne.spokaite@verizonconnect.com"
        },
        {
          "Email": "agnieszka.marciniak@verizonconnect.com"
        },
        {
          "Email": "aisha.el.sayed@verizonconnect.com"
        },
        {
          "Email": "alan.baez.wyckoff@verizonconnect.com"
        },
        {
          "Email": "alberto.gulmini@verizonconnect.com"
        },
        {
          "Email": "albert.reardon@verizonconnect.com"
        },
        {
          "Email": "aleagen.fuertes@verizonconnect.com"
        },
        {
          "Email": "alejandro.arguello@verizonconnect.com"
        },
        {
          "Email": "alejandro.infante@verizonconnect.com"
        },
        {
          "Email": "alejandro.martinez@verizonconnect.com"
        },
        {
          "Email": "alejandro.sotelo@verizonconnect.com"
        },
        {
          "Email": "alejundro.sanchez@verizonconnect.com"
        },
        {
          "Email": "alessandra.rapozeiras@verizonconnect.com"
        },
        {
          "Email": "alexander.castillo@verizonconnect.com"
        },
        {
          "Email": "alexander.fernandez@verizonconnect.com"
        },
        {
          "Email": "alexander.swenson@verizonconnect.com"
        },
        {
          "Email": "alexandra.kelly@verizonconnect.com"
        },
        {
          "Email": "alexandria.baker@verizonconnect.com"
        },
        {
          "Email": "alexis.moreno@verizonconnect.com"
        },
        {
          "Email": "alex.kongvongsai@verizonconnect.com"
        },
        {
          "Email": "alex.robalino@verizonconnect.com"
        },
        {
          "Email": "alicia.snyder@verizonconnect.com"
        },
        {
          "Email": "ali.quadri@verizonconnect.com"
        },
        {
          "Email": "alison.luebbe@verizonconnect.com"
        },
        {
          "Email": "aliyah.weems@verizonconnect.com"
        },
        {
          "Email": "allan.coliza@verizonconnect.com"
        },
        {
          "Email": "allison.heuer@verizonconnect.com"
        },
        {
          "Email": "allison.sutton@verizonconnect.com"
        },
        {
          "Email": "alysa.danise.arriba@verizonconnect.com"
        },
        {
          "Email": "alyssa.keach.alissan@verizonconnect.com"
        },
        {
          "Email": "amarilys.parra@verizonconnect.com"
        },
        {
          "Email": "amina.abdullahi@verizonconnect.com"
        },
        {
          "Email": "amy.maness@verizonconnect.com"
        },
        {
          "Email": "ana.balsalobre@movildata.com"
        },
        {
          "Email": "ana.divinagracia@verizonconnect.com"
        },
        {
          "Email": "ana.franzen@verizonconnect.com"
        },
        {
          "Email": "andrae.calderon@verizonconnect.com"
        },
        {
          "Email": "andrew.smith@verizonconnect.com"
        },
        {
          "Email": "andy.tat@verizonconnect.com"
        },
        {
          "Email": "angela.allison@verizonconnect.com"
        },
        {
          "Email": "angelo.alexi.palapar@verizonconnect.com"
        },
        {
          "Email": "annabelle.perez@verizonconnect.com"
        },
        {
          "Email": "annalle.barcia@verizonconnect.com"
        },
        {
          "Email": "anna.marie.abala@verizonconnect.com"
        },
        {
          "Email": "anna.palen@verizonconnect.com"
        },
        {
          "Email": "annarita.rinaldi@verizonconnect.com"
        },
        {
          "Email": "annarita.rinaldi@verizonconnect.com"
        },
        {
          "Email": "anna.simioli@verizonconnect.com"
        },
        {
          "Email": "anna.suranyi@verizonconnect.com"
        },
        {
          "Email": "ann.lerette@verizonconnect.com"
        },
        {
          "Email": "anthony.alicea@verizonconnect.com"
        },
        {
          "Email": "anthony.arnold@verizonconnect.com"
        },
        {
          "Email": "anthony.herrera@verizonconnect.com"
        },
        {
          "Email": "anthony.marzullo@verizonconnect.com"
        },
        {
          "Email": "anthony.santillan@verizonconnect.com"
        },
        {
          "Email": "anthony.tablan@verizonconnect.com"
        },
        {
          "Email": "april.villarreal@verizonconnect.com"
        },
        {
          "Email": "ariane.cunanan@verizonconnect.com"
        },
        {
          "Email": "arianna.parrino@verizonconnect.com"
        },
        {
          "Email": "armando.bravo@verizonconnect.com"
        },
        {
          "Email": "arnold.borilla@verizonconnect.com"
        },
        {
          "Email": "arnulfo.de.vera@verizonconnect.com"
        },
        {
          "Email": "arthur.fisk@verizonconnect.com"
        },
        {
          "Email": "asia.crew@verizonconnect.com"
        },
        {
          "Email": "asim.shahid@verizonconnect.com"
        },
        {
          "Email": "atiba.clarke@verizonconnect.com"
        },
        {
          "Email": "aubrey.lambert@verizonconnect.com"
        },
        {
          "Email": "austinsalesenablement@verizonconnect.com"
        },
        {
          "Email": "austinsalesenablement@verizonconnect.com"
        },
        {
          "Email": "barb.hunt@verizonconnect.com"
        },
        {
          "Email": "barry.caine@verizonconnect.com"
        },
        {
          "Email": "belinda.bahena@verizonconnect.com"
        },
        {
          "Email": "bence.biro@verizonconnect.com"
        },
        {
          "Email": "benjamin.gendron@verizonconnect.com"
        },
        {
          "Email": "berne.igot@verizonconnect.com"
        },
        {
          "Email": "beverly.koester@verizonconnect.com"
        },
        {
          "Email": "bhurd@verizonconnect.com"
        },
        {
          "Email": "biju.george@verizonconnect.com"
        },
        {
          "Email": "bjorn.van.den.wijngaert@verizonconnect.com"
        },
        {
          "Email": "bobby.bongolan@verizonconnect.com"
        },
        {
          "Email": "bob.hess@verizonconnect.com"
        },
        {
          "Email": "bradley.tercero@verizonconnect.com"
        },
        {
          "Email": "branden.hunter@verizonconnect.com"
        },
        {
          "Email": "brandon.shouse@verizonconnect.com"
        },
        {
          "Email": "brennan.baldwin@verizonconnect.com"
        },
        {
          "Email": "brent.nicholas@verizonconnect.com"
        },
        {
          "Email": "brenton.wellmaker@verizonconnect.com"
        },
        {
          "Email": "brett.lagrone@verizonconnect.com"
        },
        {
          "Email": "briana.marsalla@verizonconnect.com"
        },
        {
          "Email": "brian.garcia@verizonconnect.com"
        },
        {
          "Email": "brian.grantham@verizonconnect.com"
        },
        {
          "Email": "brian.kern@verizonconnect.com"
        },
        {
          "Email": "brian.madden@verizonconnect.com"
        },
        {
          "Email": "brian.masterson@verizonconnect.com"
        },
        {
          "Email": "brian.omalley@verizonconnect.com"
        },
        {
          "Email": "brian.resney@verizonconnect.com"
        },
        {
          "Email": "brian.teague@verizonconnect.com"
        },
        {
          "Email": "bryan.paul.reyes@verizonconnect.com"
        },
        {
          "Email": "caitlyn.price@verizonconnect.com"
        },
        {
          "Email": "caleb.parker@verizonconnect.com"
        },
        {
          "Email": "calvin.fox@verizonconnect.com"
        },
        {
          "Email": "cameron.wiley@verizonconnect.com"
        },
        {
          "Email": "camille.noel@verizonconnect.com"
        },
        {
          "Email": "camille.pastrana@verizonconnect.com"
        },
        {
          "Email": "candace.pflum@verizonconnect.com"
        },
        {
          "Email": "carenjoy.cubangbang@verizonconnect.com"
        },
        {
          "Email": "carla.dalessandro@verizonconnect.com"
        },
        {
          "Email": "carlos.bramonth.espinoza@verizonconnect.com"
        },
        {
          "Email": "carlos.guerrero@verizonconnect.com"
        },
        {
          "Email": "carlos.mendez.murillo@verizonconnect.com"
        },
        {
          "Email": "carol.angeleen.mateo@verizonconnect.com"
        },
        {
          "Email": "caroline.francis@verizonconnect.com"
        },
        {
          "Email": "carrinne.price@verizonconnect.com"
        },
        {
          "Email": "casandra.daliwag@verizonconnect.com"
        },
        {
          "Email": "casey.maloney@verizonconnect.com"
        },
        {
          "Email": "catarina.borges.martins.vieira.futacsi@verizonconnect.com"
        },
        {
          "Email": "catherine.macul@verizonconnect.com"
        },
        {
          "Email": "cayla.williams@verizonconnect.com"
        },
        {
          "Email": "cecilia.machuca@movildata.com"
        },
        {
          "Email": "celina.brandao@verizonconnect.com"
        },
        {
          "Email": "celines.torres@verizonconnect.com"
        },
        {
          "Email": "cesar.jimenez@verizonconnect.com"
        },
        {
          "Email": "chad.serafin@verizonconnect.com"
        },
        {
          "Email": "charisse.angelie.claro@verizonconnect.com"
        },
        {
          "Email": "chase.bailey@verizonconnect.com"
        },
        {
          "Email": "cheenee.florentino@verizonconnect.com"
        },
        {
          "Email": "cherie.carmelotes@verizonconnect.com"
        },
        {
          "Email": "cherrie.may.sarno@verizonconnect.com"
        },
        {
          "Email": "cheryl.sheridan@verizonconnect.com"
        },
        {
          "Email": "chiara.massarenti@verizonconnect.com"
        },
        {
          "Email": "chrisha.mae.barberan@verizonconnect.com"
        },
        {
          "Email": "christiane.freches.barroca@verizonconnect.com"
        },
        {
          "Email": "christian.gibson@verizonconnect.com"
        },
        {
          "Email": "christian.mendoza@verizonconnect.com"
        },
        {
          "Email": "christian.sayson@verizonconnect.com"
        },
        {
          "Email": "christie.rose.davin@verizonconnect.com"
        },
        {
          "Email": "christin.connell@verizonconnect.com"
        },
        {
          "Email": "christine.miller@verizonconnect.com"
        },
        {
          "Email": "christopher.diaz@verizonconnect.com"
        },
        {
          "Email": "christopher.wilson@verizonconnect.com"
        },
        {
          "Email": "chris.torres@verizonconnect.com"
        },
        {
          "Email": "chris.villanueva@verizonconnect.com"
        },
        {
          "Email": "cindy.xelhua@verizonconnect.com"
        },
        {
          "Email": "clarisse.romero@verizonconnect.com"
        },
        {
          "Email": "collin.baney@verizonconnect.com"
        },
        {
          "Email": "contract.management@verizonconnect.com"
        },
        {
          "Email": "cory.huggins@verizonconnect.com"
        },
        {
          "Email": "craig.comstock@verizonconnect.com"
        },
        {
          "Email": "craig.dempsey@verizonconnect.com"
        },
        {
          "Email": "craig.loeffler@verizonconnect.com"
        },
        {
          "Email": "creslen.relosa@verizonconnect.com"
        },
        {
          "Email": "cressida.mae.mendoza@verizonconnect.com"
        },
        {
          "Email": "cristian.santos@verizonconnect.com"
        },
        {
          "Email": "cristina.madrigal@verizonconnect.com"
        },
        {
          "Email": "cristina.toledo@verizonconnect.com"
        },
        {
          "Email": "crystal.reyes@verizonconnect.com"
        },
        {
          "Email": "cyril.bodden@verizonconnect.com"
        },
        {
          "Email": "dana.collins@verizonconnect.com"
        },
        {
          "Email": "dan.borchers@verizonconnect.com"
        },
        {
          "Email": "daniel.gulane@verizonconnect.com"
        },
        {
          "Email": "daniel.hernandez@verizonconnect.com"
        },
        {
          "Email": "daniel.miller@verizonconnect.com"
        },
        {
          "Email": "daniel.rios@verizonconnect.com"
        },
        {
          "Email": "daniel.rodriguez@verizonconnect.com"
        },
        {
          "Email": "daniel.westra@verizonconnect.com"
        },
        {
          "Email": "danilo.bilocura@verizonconnect.com"
        },
        {
          "Email": "daric.schroeder@verizonconnect.com"
        },
        {
          "Email": "dario.frisone@verizonconnect.com"
        },
        {
          "Email": "daron.nelson@verizonconnect.com"
        },
        {
          "Email": "darrell.mcquarter@verizonconnect.com"
        },
        {
          "Email": "darren.evans@verizonconnect.com"
        },
        {
          "Email": "darren.lapeceros@verizonconnect.com"
        },
        {
          "Email": "darrold.donn.ballesteros@verizonconnect.com"
        },
        {
          "Email": "dave.dominick.sarino@verizonconnect.com"
        },
        {
          "Email": "david.estime@verizonconnect.com"
        },
        {
          "Email": "david.flores@verizonconnect.com"
        },
        {
          "Email": "david.lazaro@movildata.com"
        },
        {
          "Email": "david.luber@verizonconnect.com"
        },
        {
          "Email": "david.mesina@verizonconnect.com"
        },
        {
          "Email": "david.millis@verizonconnect.com"
        },
        {
          "Email": "david.sanchez@verizonconnect.com"
        },
        {
          "Email": "david.sellner@verizonconnect.com"
        },
        {
          "Email": "daysia.evans@verizonconnect.com"
        },
        {
          "Email": "demetri.kundanis@verizonconnect.com"
        },
        {
          "Email": "dennis.sullivan@verizonconnect.com"
        },
        {
          "Email": "denn.pantanilla@verizonconnect.com"
        },
        {
          "Email": "denny.palmer@verizonconnect.com"
        },
        {
          "Email": "denys.gyrod.aguilar@verizonconnect.com"
        },
        {
          "Email": "derik.nagel@verizonconnect.com"
        },
        {
          "Email": "desma.draper@verizonconnect.com"
        },
        {
          "Email": "devon.felder@verizonconnect.com"
        },
        {
          "Email": "devon.stevenson@verizonconnect.com"
        },
        {
          "Email": "dewi.yip@verizonconnect.com"
        },
        {
          "Email": "deyton.batchelor@verizonconnect.com"
        },
        {
          "Email": "diana.chavez-martinez@verizonconnect.com"
        },
        {
          "Email": "didem.yildiz@verizonconnect.com"
        },
        {
          "Email": "diego.flores@verizonconnect.com"
        },
        {
          "Email": "dominick.miller.orama@verizonconnect.com"
        },
        {
          "Email": "dominick.niboli@verizonconnect.com"
        },
        {
          "Email": "dominika.cicha@verizonconnect.com"
        },
        {
          "Email": "dominika.lyko@verizonconnect.com"
        },
        {
          "Email": "dominique.lear@verizonconnect.com"
        },
        {
          "Email": "donavon.graves@verizonconnect.com"
        },
        {
          "Email": "dora.toth.fekete@verizonconnect.com"
        },
        {
          "Email": "douglas.kelleher@verizonconnect.com"
        },
        {
          "Email": "drew.cooper@verizonconnect.com"
        },
        {
          "Email": "duncan.handford@verizonconnect.com"
        },
        {
          "Email": "dustin.fultz@verizonconnect.com"
        },
        {
          "Email": "dylan.bridges@verizonconnect.com"
        },
        {
          "Email": "ean.fellner@verizonconnect.com"
        },
        {
          "Email": "earl.fransua@verizonconnect.com"
        },
        {
          "Email": "eddie.davis@verizonconnect.com"
        },
        {
          "Email": "edgar.rodriguez@verizonconnect.com"
        },
        {
          "Email": "eduardo.jr.llaneta@verizonconnect.com"
        },
        {
          "Email": "eduardo.rodriguez1@verizonconnect.com"
        },
        {
          "Email": "edward.davis@verizonconnect.com"
        },
        {
          "Email": "edward.lemmons@verizonconnect.com"
        },
        {
          "Email": "edwin.jovel.hernandez@verizonconnect.com"
        },
        {
          "Email": "ekaterina.hand@verizonconnect.com"
        },
        {
          "Email": "elisa.devincentis@verizonconnect.com"
        },
        {
          "Email": "elisa.oioli@verizonconnect.com"
        },
        {
          "Email": "elizabeth.magnuson1@verizonconnect.com"
        },
        {
          "Email": "ella.parr@verizonconnect.com"
        },
        {
          "Email": "elvira.alvarez@verizonconnect.com"
        },
        {
          "Email": "elyce.shill@verizonconnect.com"
        },
        {
          "Email": "emese.kovacsne.talas@verizonconnect.com"
        },
        {
          "Email": "emilia.racz@verizonconnect.com"
        },
        {
          "Email": "emily.werhane@verizonconnect.com"
        },
        {
          "Email": "emily.willems@verizonconnect.com"
        },
        {
          "Email": "emma.baker@verizonconnect.com"
        },
        {
          "Email": "enrico.deluca@verizonconnect.com"
        },
        {
          "Email": "eoin.mcmahon@verizonconnect.com"
        },
        {
          "Email": "eric.bilas@verizonconnect.com"
        },
        {
          "Email": "eric.franc@verizonconnect.com"
        },
        {
          "Email": "eric.rosaroso@verizonconnect.com"
        },
        {
          "Email": "erin.siemens@verizonconnect.com"
        },
        {
          "Email": "erline.may.oneza@verizonconnect.com"
        },
        {
          "Email": "errol.latibeaudiere@verizonconnect.com"
        },
        {
          "Email": "erwin.de.la.rosa@verizonconnect.com"
        },
        {
          "Email": "esteban.romero@verizonconnect.com"
        },
        {
          "Email": "esther.joy.mopas@verizonconnect.com"
        },
        {
          "Email": "esther.rosario@verizonconnect.com"
        },
        {
          "Email": "ethan.brunson@verizonconnect.com"
        },
        {
          "Email": "ezekiel.jordan.morales@verizonconnect.com"
        },
        {
          "Email": "fabian.kaufmann@verizonconnect.com"
        },
        {
          "Email": "faith.harlequin.advincula@verizonconnect.com"
        },
        {
          "Email": "farah.anzar@verizonconnect.com"
        },
        {
          "Email": "fatima.oliviera@verizonconnect.com"
        },
        {
          "Email": "feeras.sako@verizonconnect.com"
        },
        {
          "Email": "felicia.miller@verizonconnect.com"
        },
        {
          "Email": "fmofficeasales@verizonconnect.com"
        },
        {
          "Email": "francesca.colleen.cudal@verizonconnect.com"
        },
        {
          "Email": "francesca.watts@verizonconnect.com"
        },
        {
          "Email": "francesco.cavallari@verizonconnect.com"
        },
        {
          "Email": "francisco.flores@verizonconnect.com"
        },
        {
          "Email": "gabriela.arenas@verizonconnect.com"
        },
        {
          "Email": "gabriel.ortiz@verizonconnect.com"
        },
        {
          "Email": "gail.flores@verizonconnect.com"
        },
        {
          "Email": "gareth.moynihan@verizonconnect.com"
        },
        {
          "Email": "gavin.hultgren@verizonconnect.com"
        },
        {
          "Email": "geklin.cleary@verizonconnect.com"
        },
        {
          "Email": "genesis.jacaban@verizonconnect.com"
        },
        {
          "Email": "george.pineda@verizonconnect.com"
        },
        {
          "Email": "geraldine.benicelli@verizonconnect.com"
        },
        {
          "Email": "gerry.rinn@verizonconnect.com"
        },
        {
          "Email": "giada.andriollo@verizonconnect.com"
        },
        {
          "Email": "gianfranco.pastrana@verizonconnect.com"
        },
        {
          "Email": "giomar.oquendo@verizonconnect.com"
        },
        {
          "Email": "giordanny.alvarado@verizonconnect.com"
        },
        {
          "Email": "giovanni.baccega@verizonconnect.com"
        },
        {
          "Email": "glenn.smith@verizonconnect.com"
        },
        {
          "Email": "gordon.giles@verizonconnect.com"
        },
        {
          "Email": "gordon.glisson@verizonconnect.com"
        },
        {
          "Email": "gregory.bernadeau@verizonconnect.com"
        },
        {
          "Email": "greg.weinkam@verizonconnect.com"
        },
        {
          "Email": "greta.medawar@verizonconnect.com"
        },
        {
          "Email": "hannah.erika.rifol@verizonconnect.com"
        },
        {
          "Email": "harry.santiago@verizonconnect.com"
        },
        {
          "Email": "hasan.ismail@verizonconnect.com"
        },
        {
          "Email": "hazel.marie.pallagao@verizonconnect.com"
        },
        {
          "Email": "heather.duncan@verizonconnect.com"
        },
        {
          "Email": "heaven.sinco@verizonconnect.com"
        },
        {
          "Email": "helena.faye.tomista@verizonconnect.com"
        },
        {
          "Email": "herbert.dexter.costales@verizonconnect.com"
        },
        {
          "Email": "hilamar.carreon@verizonconnect.com"
        },
        {
          "Email": "hill.son@verizonconnect.com"
        },
        {
          "Email": "hugo.dufrien.abrantes@verizonconnect.com"
        },
        {
          "Email": "hugo.monteiro@verizonconnect.com"
        },
        {
          "Email": "husnain.shah@verizonconnect.com"
        },
        {
          "Email": "ilaria.lodovici@verizonconnect.com"
        },
        {
          "Email": "irwin.kyle.marte.patangan@verizonconnect.com"
        },
        {
          "Email": "isabel.lopez@movildata.com"
        },
        {
          "Email": "ishmael.holdman@verizonconnect.com"
        },
        {
          "Email": "israel.medina@verizonconnect.com"
        },
        {
          "Email": "israel.ong@verizonconnect.com"
        },
        {
          "Email": "ivan.lara-garza@verizonconnect.com"
        },
        {
          "Email": "iwona.zoltowska@verizonconnect.com"
        },
        {
          "Email": "izabela.plominska@verizonconnect.com"
        },
        {
          "Email": "jackie.jallick@verizonconnect.com"
        },
        {
          "Email": "jack.marsalla@verizonconnect.com"
        },
        {
          "Email": "jackylyn.ramirez@verizonconnect.com"
        },
        {
          "Email": "jacob.mcclellan@verizonconnect.com"
        },
        {
          "Email": "jacob.willis@verizonconnect.com"
        },
        {
          "Email": "jakub.stemplewski@verizonconnect.com"
        },
        {
          "Email": "james.addy@verizonconnect.com"
        },
        {
          "Email": "james.booker2@verizonconnect.com"
        },
        {
          "Email": "james.brian.flores@verizonconnect.com"
        },
        {
          "Email": "james.eriksen@verizonconnect.com"
        },
        {
          "Email": "james.santana@verizonconnect.com"
        },
        {
          "Email": "james.sullivan@verizonconnect.com"
        },
        {
          "Email": "jamez.taylor@verizonconnect.com"
        },
        {
          "Email": "jamie.mcelroy@verizonconnect.com"
        },
        {
          "Email": "janetta.goedegebuure@verizonconnect.com"
        },
        {
          "Email": "janine.tampus@verizonconnect.com"
        },
        {
          "Email": "jared.blazer@verizonconnect.com"
        },
        {
          "Email": "jared.lively@verizonconnect.com"
        },
        {
          "Email": "jarrett.nelson@verizonconnect.com"
        },
        {
          "Email": "jasmine.johnson@verizonconnect.com"
        },
        {
          "Email": "jason.aronne@verizonconnect.com"
        },
        {
          "Email": "jason.bradley@verizonconnect.com"
        },
        {
          "Email": "jason.ross@verizonconnect.com"
        },
        {
          "Email": "javier.curiel@verizonconnect.com"
        },
        {
          "Email": "jaydawn.romero@verizonconnect.com"
        },
        {
          "Email": "jay.khatib@verizonconnect.com"
        },
        {
          "Email": "jaymark.mino@verizonconnect.com"
        },
        {
          "Email": "jaymien.mithalicop@verizonconnect.com"
        },
        {
          "Email": "jaypee.capuyan@verizonconnect.com"
        },
        {
          "Email": "jeane.piquero@verizonconnect.com"
        },
        {
          "Email": "jean.mikko.paragas@verizonconnect.com"
        },
        {
          "Email": "jeff.bucsa@verizonconnect.com"
        },
        {
          "Email": "jefferlyn.arellano@verizonconnect.com"
        },
        {
          "Email": "jeffrey.caasalan@verizonconnect.com"
        },
        {
          "Email": "jeffrey.gisriel@verizonconnect.com"
        },
        {
          "Email": "jeffrey.jt.vikari@verizonconnect.com"
        },
        {
          "Email": "jeffrey.lawson@verizonconnect.com"
        },
        {
          "Email": "jeffrey.mercado@verizonconnect.com"
        },
        {
          "Email": "jennifer.quinones@verizonconnect.com"
        },
        {
          "Email": "jens.groening@verizonconnect.com"
        },
        {
          "Email": "jered.samson@verizonconnect.com"
        },
        {
          "Email": "jeremy.albach@verizonconnect.com"
        },
        {
          "Email": "jeremy.flores@verizonconnect.com"
        },
        {
          "Email": "jerreme.cailing@verizonconnect.com"
        },
        {
          "Email": "jesse.holmstrom@verizonconnect.com"
        },
        {
          "Email": "jessica.day@verizonconnect.com"
        },
        {
          "Email": "jessica.graff@verizonconnect.com"
        },
        {
          "Email": "jessica.wagner@verizonconnect.com"
        },
        {
          "Email": "jessica.wingenroth@verizonconnect.com"
        },
        {
          "Email": "jhosel.estimo@verizonconnect.com"
        },
        {
          "Email": "jihyun.kim.schreiber@verizonconnect.com"
        },
        {
          "Email": "jimha.mancio@verizonconnect.com"
        },
        {
          "Email": "jimmie.brown@verizonconnect.com"
        },
        {
          "Email": "joana.nobre@verizonconnect.com"
        },
        {
          "Email": "joana.nobre@verizonconnect.com"
        },
        {
          "Email": "jocelina.sari@verizonconnect.com"
        },
        {
          "Email": "joemar.mcleod@verizonconnect.com"
        },
        {
          "Email": "johana.amil@verizonconnect.com"
        },
        {
          "Email": "john.arbie.ribucan@verizonconnect.com"
        },
        {
          "Email": "john.cecala@verizonconnect.com"
        },
        {
          "Email": "john.horney@verizonconnect.com"
        },
        {
          "Email": "john.karl.gutierrez@verizonconnect.com"
        },
        {
          "Email": "john.lloyd.aben@verizonconnect.com"
        },
        {
          "Email": "john.mansor@verizonconnect.com"
        },
        {
          "Email": "john.michael@verizonconnect.com"
        },
        {
          "Email": "john.ramos@verizonconnect.com"
        },
        {
          "Email": "john.santos@verizonconnect.com"
        },
        {
          "Email": "johnzel.ivan.tiples@verizonconnect.com"
        },
        {
          "Email": "jonathan.brown@verizonconnect.com"
        },
        {
          "Email": "jonathan.gray@verizonconnect.com"
        },
        {
          "Email": "jonathan.valenzuela@verizonconnect.com"
        },
        {
          "Email": "jonel.yanez@verizonconnect.com"
        },
        {
          "Email": "jordan.ferrell@verizonconnect.com"
        },
        {
          "Email": "jorge.blas@verizonconnect.com"
        },
        {
          "Email": "jorge.lopez.vela@verizonconnect.com"
        },
        {
          "Email": "jose.flores@verizonconnect.com"
        },
        {
          "Email": "jose.goncalves@verizonconnect.com"
        },
        {
          "Email": "jose.luis.guttierres.jr@verizonconnect.com"
        },
        {
          "Email": "joseph.bennett@verizonconnect.com"
        },
        {
          "Email": "joseph.coulter@verizonconnect.com"
        },
        {
          "Email": "joseph.difiore@verizonconnect.com"
        },
        {
          "Email": "joseph.hill1@verizonconnect.com"
        },
        {
          "Email": "joseph.kloeppel@verizonconnect.com"
        },
        {
          "Email": "joseph.martinez@verizonconnect.com"
        },
        {
          "Email": "joseph.ramos@verizonconnect.com"
        },
        {
          "Email": "joseph.wicinske@verizonconnect.com"
        },
        {
          "Email": "josh.kronenberger@verizonconnect.com"
        },
        {
          "Email": "joshua.fininis@verizonconnect.com"
        },
        {
          "Email": "joshua.garner1@verizonconnect.com"
        },
        {
          "Email": "joshua.hawkins@verizonconnect.com"
        },
        {
          "Email": "joshua.reifsnyder@verizonconnect.com"
        },
        {
          "Email": "joshua.rivera@verizonconnect.com"
        },
        {
          "Email": "joshua.toth@verizonconnect.com"
        },
        {
          "Email": "josh.van.boxtel@verizonconnect.com"
        },
        {
          "Email": "josue.graciano@verizonconnect.com"
        },
        {
          "Email": "joyce.renilyn.fernandez@verizonconnect.com"
        },
        {
          "Email": "juan.concha@verizonconnect.com"
        },
        {
          "Email": "juan.escobar.mateos@verizonconnect.com"
        },
        {
          "Email": "juan.porras@verizonconnect.com"
        },
        {
          "Email": "judit.pinter@verizonconnect.com"
        },
        {
          "Email": "julia.lojko@verizonconnect.com"
        },
        {
          "Email": "juliette.eludut@verizonconnect.com"
        },
        {
          "Email": "juneil.soler@verizonconnect.com"
        },
        {
          "Email": "justin.avila@verizonconnect.com"
        },
        {
          "Email": "justin.corio@verizonconnect.com"
        },
        {
          "Email": "justin.harvey@verizonconnect.com"
        },
        {
          "Email": "justin.osullivan@verizonconnect.com"
        },
        {
          "Email": "justin.simpson@verizonconnect.com"
        },
        {
          "Email": "justin.teisch@verizonconnect.com"
        },
        {
          "Email": "jutil.millares@verizonconnect.com"
        },
        {
          "Email": "jv.antonio1@verizonconnect.com"
        },
        {
          "Email": "kamil.oz@verizonconnect.com"
        },
        {
          "Email": "karla.illia@verizonconnect.com"
        },
        {
          "Email": "karla.reyes@verizonconnect.com"
        },
        {
          "Email": "karolina.zablotna@verizonconnect.com"
        },
        {
          "Email": "katherine.merchant@verizonconnect.com"
        },
        {
          "Email": "kavon.seaton@verizonconnect.com"
        },
        {
          "Email": "kelly.fouquier@verizonconnect.com"
        },
        {
          "Email": "kelly.hogge@verizonconnect.com"
        },
        {
          "Email": "kendra.haas@verizonconnect.com"
        },
        {
          "Email": "ken.mallo@verizonconnect.com"
        },
        {
          "Email": "kesly.paul@verizonconnect.com"
        },
        {
          "Email": "kevin.johlie@verizonconnect.com"
        },
        {
          "Email": "kevin.marcussen@verizonconnect.com"
        },
        {
          "Email": "kevin.nader@verizonconnect.com"
        },
        {
          "Email": "kevin.siwik@verizonconnect.com"
        },
        {
          "Email": "khaled.abukhdair@verizonconnect.com"
        },
        {
          "Email": "khalid.jubara@verizonconnect.com"
        },
        {
          "Email": "kimberly.dediego@verizonconnect.com"
        },
        {
          "Email": "kinga.nagy@verizonconnect.com"
        },
        {
          "Email": "kit.bryan.de.guzman@verizonconnect.com"
        },
        {
          "Email": "kobe.dabuit@verizonconnect.com"
        },
        {
          "Email": "krista.marie.clemente@verizonconnect.com"
        },
        {
          "Email": "kristen.brown@verizonconnect.com"
        },
        {
          "Email": "krisztina.rigal.peyrot@verizonconnect.com"
        },
        {
          "Email": "krystal.blacklock@verizonconnect.com"
        },
        {
          "Email": "krystian.peczek@verizonconnect.com"
        },
        {
          "Email": "kyle.rostenbach@verizonconnect.com"
        },
        {
          "Email": "laura.manfredonia@verizonconnect.com"
        },
        {
          "Email": "laura.peterfay@verizonconnect.com"
        },
        {
          "Email": "laura.pozzati@verizonconnect.com"
        },
        {
          "Email": "lauren.faust@verizonconnect.com"
        },
        {
          "Email": "lauren.ramos@verizonconnect.com"
        },
        {
          "Email": "lauren.syracuse@verizonconnect.com"
        },
        {
          "Email": "lawrence.rhea@verizonconnect.com"
        },
        {
          "Email": "leandera.murray@verizonconnect.com"
        },
        {
          "Email": "leo.marchal@verizonconnect.com"
        },
        {
          "Email": "leonard.lugardo@verizonconnect.com"
        },
        {
          "Email": "leonorah.sunpungco@verizonconnect.com"
        },
        {
          "Email": "leonora.javori@verizonconnect.com"
        },
        {
          "Email": "leroy.bostick@verizonconnect.com"
        },
        {
          "Email": "leroy.celicious@verizonconnect.com"
        },
        {
          "Email": "leslie.mar@verizonconnect.com"
        },
        {
          "Email": "lester.malanowski@verizonconnect.com"
        },
        {
          "Email": "lido.munoz@verizonconnect.com"
        },
        {
          "Email": "lilla.varga@verizonconnect.com"
        },
        {
          "Email": "linett.rios@verizonconnect.com"
        },
        {
          "Email": "lloyd.johnson@verizonconnect.com"
        },
        {
          "Email": "logan.newman@verizonconnect.com"
        },
        {
          "Email": "lorette.moore@verizonconnect.com"
        },
        {
          "Email": "loukmane.afalfiz@verizonconnect.com"
        },
        {
          "Email": "lucas.baumgardner@verizonconnect.com"
        },
        {
          "Email": "lucas.chapman@verizonconnect.com"
        },
        {
          "Email": "lucas.cherry@verizonconnect.com"
        },
        {
          "Email": "lucas.sousa@verizonconnect.com"
        },
        {
          "Email": "lued.santiago@verizonconnect.com"
        },
        {
          "Email": "luis.ibanez.cruz@verizonconnect.com"
        },
        {
          "Email": "lyndale.jay.dandan@verizonconnect.com"
        },
        {
          "Email": "mackenzie.shepherd@verizonconnect.com"
        },
        {
          "Email": "madelyne.soto@verizonconnect.com"
        },
        {
          "Email": "mahi.akram@verizonconnect.com"
        },
        {
          "Email": "malia.nguyen@verizonconnect.com"
        },
        {
          "Email": "ma.millenie.enot@verizonconnect.com"
        },
        {
          "Email": "mandy.williard@verizonconnect.com"
        },
        {
          "Email": "marcello.biscione@verizonconnect.com"
        },
        {
          "Email": "marc.gil.francisco@verizonconnect.com"
        },
        {
          "Email": "marco.aguirre@verizonconnect.com"
        },
        {
          "Email": "marco.mexquitic@verizonconnect.com"
        },
        {
          "Email": "marc.rhymaun@verizonconnect.com"
        },
        {
          "Email": "maria.bene@verizonconnect.com"
        },
        {
          "Email": "maria.cristina.salundaguit@verizonconnect.com"
        },
        {
          "Email": "maria.diaz.castro@movildata.com"
        },
        {
          "Email": "maria.heslinga@verizonconnect.com"
        },
        {
          "Email": "maria.kristina.abiog@verizonconnect.com"
        },
        {
          "Email": "maria.marti@verizonconnect.com"
        },
        {
          "Email": "maria.melo@verizonconnect.com"
        },
        {
          "Email": "maria.reyes.montemayor@verizonconnect.com"
        },
        {
          "Email": "marielle.coronado@verizonconnect.com"
        },
        {
          "Email": "mariel.reyes@verizonconnect.com"
        },
        {
          "Email": "marisol.dejesus@verizonconnect.com"
        },
        {
          "Email": "marivic.crame@verizonconnect.com"
        },
        {
          "Email": "marjorie.villaverde@verizonconnect.com"
        },
        {
          "Email": "mark.roguel@verizonconnect.com"
        },
        {
          "Email": "marten.alvarado@verizonconnect.com"
        },
        {
          "Email": "mary.cris.madeja@verizonconnect.com"
        },
        {
          "Email": "mary.louie.esturas@verizonconnect.com"
        },
        {
          "Email": "mary.rodriguez1@verizonconnect.com"
        },
        {
          "Email": "mason.johnson@verizonconnect.com"
        },
        {
          "Email": "matthew.lovelace@verizonconnect.com"
        },
        {
          "Email": "matthew.riccardi@verizonconnect.com"
        },
        {
          "Email": "matthew.wearne@verizonconnect.com"
        },
        {
          "Email": "matt.ilardi@verizonconnect.com"
        },
        {
          "Email": "may.joanna.yu@verizonconnect.com"
        },
        {
          "Email": "megale.harper@verizonconnect.com"
        },
        {
          "Email": "megane.silvente1@verizonconnect.com"
        },
        {
          "Email": "melanie.ford@verizonconnect.com"
        },
        {
          "Email": "melissa.haney@verizonconnect.com"
        },
        {
          "Email": "melissa.otero@verizonconnect.com"
        },
        {
          "Email": "micah.ballesteros@verizonconnect.com"
        },
        {
          "Email": "michael.barnes@verizonconnect.com"
        },
        {
          "Email": "michael.estrada@verizonconnect.com"
        },
        {
          "Email": "michael.fonseca@verizonconnect.com"
        },
        {
          "Email": "michael.kipp@verizonconnect.com"
        },
        {
          "Email": "michael.landini@verizonconnect.com"
        },
        {
          "Email": "michael.lombardo@verizonconnect.com"
        },
        {
          "Email": "michael.melichar@verizonconnect.com"
        },
        {
          "Email": "michael.perez@verizonconnect.com"
        },
        {
          "Email": "michael.shores@verizonconnect.com"
        },
        {
          "Email": "michael.terpstra@verizonconnect.com"
        },
        {
          "Email": "michael.trocchio@verizonconnect.com"
        },
        {
          "Email": "michelle.dephillips@verizonconnect.com"
        },
        {
          "Email": "michelle.ebrado@verizonconnect.com"
        },
        {
          "Email": "michelle.oceguera@verizonconnect.com"
        },
        {
          "Email": "michelle.valenti@verizonconnect.com"
        },
        {
          "Email": "michelle.villasana@verizonconnect.com"
        },
        {
          "Email": "miguel.vega@verizonconnect.com"
        },
        {
          "Email": "mikee.april.chan@verizonconnect.com"
        },
        {
          "Email": "mike.simmons@verizonconnect.com"
        },
        {
          "Email": "milton.cortes@verizonconnect.com"
        },
        {
          "Email": "miraluna.animas@verizonconnect.com"
        },
        {
          "Email": "miriam.cardenas@verizonconnect.com"
        },
        {
          "Email": "mischka.de.boer@verizonconnect.com"
        },
        {
          "Email": "misty.stone@verizonconnect.com"
        },
        {
          "Email": "mitchell.stanton@verizonconnect.com"
        },
        {
          "Email": "mocca.abos@verizonconnect.com"
        },
        {
          "Email": "mollie.bodian@verizonconnect.com"
        },
        {
          "Email": "monica.crespo@verizonconnect.com"
        },
        {
          "Email": "monica.galan.pulido@movildata.com"
        },
        {
          "Email": "monica.pezzi@verizonconnect.com"
        },
        {
          "Email": "monica.yanni.bautista@verizonconnect.com"
        },
        {
          "Email": "monika.legan@verizonconnect.com"
        },
        {
          "Email": "monique.smith@verizonconnect.com"
        },
        {
          "Email": "monique.van.gulik@verizonconnect.com"
        },
        {
          "Email": "morgan.adams@verizonconnect.com"
        },
        {
          "Email": "mylene.suazo@verizonconnect.com"
        },
        {
          "Email": "nadeem.hadaf@verizonconnect.com"
        },
        {
          "Email": "nasir.osman@verizonconnect.com"
        },
        {
          "Email": "natalie.lebron@verizonconnect.com"
        },
        {
          "Email": "natarsha.walter@verizonconnect.com"
        },
        {
          "Email": "natasha.wright@verizonconnect.com"
        },
        {
          "Email": "nathan.logan@verizonconnect.com"
        },
        {
          "Email": "natoshua.kamara@verizonconnect.com"
        },
        {
          "Email": "navya.narasimhappa@verizonconnect.com"
        },
        {
          "Email": "neal.behrman@verizonconnect.com"
        },
        {
          "Email": "nediriza.bacalla@verizonconnect.com"
        },
        {
          "Email": "nelsa.napoles@verizonconnect.com"
        },
        {
          "Email": "nelson.duong@verizonconnect.com"
        },
        {
          "Email": "nicholas.carrington@verizonconnect.com"
        },
        {
          "Email": "nicholas.waters@verizonconnect.com"
        },
        {
          "Email": "nicholas.yanez@verizonconnect.com"
        },
        {
          "Email": "nicole.fininis@verizonconnect.com"
        },
        {
          "Email": "nicole.ortiz.cameron@verizonconnect.com"
        },
        {
          "Email": "nicole.ramsey@verizonconnect.com"
        },
        {
          "Email": "nigel.tocher@verizonconnect.com"
        },
        {
          "Email": "nikolas.reyes@verizonconnect.com"
        },
        {
          "Email": "noe.garcia@verizonconnect.com"
        },
        {
          "Email": "noel.madrigal@verizonconnect.com"
        },
        {
          "Email": "no-reply@gainsightapp.com"
        },
        {
          "Email": "oliver.rafou@verizonconnect.com"
        },
        {
          "Email": "omar.zavala@verizonconnect.com"
        },
        {
          "Email": "onochie.ani@verizonconnect.com"
        },
        {
          "Email": "orlando.valdoz@verizonconnect.com"
        },
        {
          "Email": "oscar.ceballos1@verizonconnect.com"
        },
        {
          "Email": "pablo.rosillo.castro@movildata.com"
        },
        {
          "Email": "paloma.mora.pina@verizonconnect.com"
        },
        {
          "Email": "pamela.colorado.silva@verizonconnect.com"
        },
        {
          "Email": "pamela.velez@verizonconnect.com"
        },
        {
          "Email": "panna.matyas@verizonconnect.com"
        },
        {
          "Email": "patrick.nolan@verizonconnect.com"
        },
        {
          "Email": "patrick.quinto@verizonconnect.com"
        },
        {
          "Email": "patrick.ryan@verizonconnect.com"
        },
        {
          "Email": "patrycja.szczyrbak@verizonconnect.com"
        },
        {
          "Email": "patty.york@verizonconnect.com"
        },
        {
          "Email": "paul.bauman@verizonconnect.com"
        },
        {
          "Email": "paulette.rhymaun@verizonconnect.com"
        },
        {
          "Email": "paul.hudson@verizonconnect.com"
        },
        {
          "Email": "paul.kelly@verizonconnect.com"
        },
        {
          "Email": "paul.matthis@verizonconnect.com"
        },
        {
          "Email": "paul.sorensen@verizonconnect.com"
        },
        {
          "Email": "pedro.moreno@verizonconnect.com"
        },
        {
          "Email": "per.akerstrom@verizonconnect.com"
        },
        {
          "Email": "perrine.rossi@verizonconnect.com"
        },
        {
          "Email": "peter.jaskot@verizonconnect.com"
        },
        {
          "Email": "peter.platten@verizonconnect.com"
        },
        {
          "Email": "phil.kutz@verizonconnect.com"
        },
        {
          "Email": "phil.sachs@verizonconnect.com"
        },
        {
          "Email": "piroska.egedy@verizonconnect.com"
        },
        {
          "Email": "prichie.lampunay@verizonconnect.com"
        },
        {
          "Email": "princess.joy.bico@verizonconnect.com"
        },
        {
          "Email": "princess.sims@verizonconnect.com"
        },
        {
          "Email": "pstewart@verizonconnect.com"
        },
        {
          "Email": "quentin.boyd.wiley@verizonconnect.com"
        },
        {
          "Email": "quinnton.duenez@verizonconnect.com"
        },
        {
          "Email": "rachael.capizzano@verizonconnect.com"
        },
        {
          "Email": "rachel.aleliunas@verizonconnect.com"
        },
        {
          "Email": "ramon.r.rodriguez.vazquez@verizonconnect.com"
        },
        {
          "Email": "randall.berman@verizonconnect.com"
        },
        {
          "Email": "raquel.ferrante@verizonconnect.com"
        },
        {
          "Email": "rashad.gilmore@verizonconnect.com"
        },
        {
          "Email": "raymond.zujus@verizonconnect.com"
        },
        {
          "Email": "rea.mas@verizonconnect.com"
        },
        {
          "Email": "reeza.ann.narawi@verizonconnect.com"
        },
        {
          "Email": "regine.jabonita@verizonconnect.com"
        },
        {
          "Email": "reka.zelenak@verizonconnect.com"
        },
        {
          "Email": "renata.falls-jefferson@verizonconnect.com"
        },
        {
          "Email": "revodem.napone@verizonconnect.com"
        },
        {
          "Email": "rhale@verizonconnect.com"
        },
        {
          "Email": "rhea.alla@verizonconnect.com"
        },
        {
          "Email": "rhea.rodriguez@verizonconnect.com"
        },
        {
          "Email": "rhonda.bartholomew@verizonconnect.com"
        },
        {
          "Email": "ricardo.chavez@verizonconnect.com"
        },
        {
          "Email": "ricar.liphad@verizonconnect.com"
        },
        {
          "Email": "richard.ecaldre@verizonconnect.com"
        },
        {
          "Email": "richard.fett@verizonconnect.com"
        },
        {
          "Email": "richard.wilkerson@verizonconnect.com"
        },
        {
          "Email": "rizalino.moralde@verizonconnect.com"
        },
        {
          "Email": "riza.pranza@verizonconnect.com"
        },
        {
          "Email": "roberto.quinones@verizonconnect.com"
        },
        {
          "Email": "robert.rhodes@verizonconnect.com"
        },
        {
          "Email": "robert.zahorak@verizonconnect.com"
        },
        {
          "Email": "robin.whitlock@verizonconnect.com"
        },
        {
          "Email": "rob.jarvis@verizonconnect.com"
        },
        {
          "Email": "rob.maksimow@verizonconnect.com"
        },
        {
          "Email": "rodel.lumayaga@verizonconnect.com"
        },
        {
          "Email": "roger.gumin@verizonconnect.com"
        },
        {
          "Email": "roger.stell@verizonconnect.com"
        },
        {
          "Email": "romela.romualdo@verizonconnect.com"
        },
        {
          "Email": "ronald.angeles@verizonconnect.com"
        },
        {
          "Email": "ronald.cortez@verizonconnect.com"
        },
        {
          "Email": "ronnie.oudijk@verizonconnect.com"
        },
        {
          "Email": "rosalinda.mesa@verizonconnect.com"
        },
        {
          "Email": "ross.harmon@verizonconnect.com"
        },
        {
          "Email": "rowan.dionisopoulos@verizonconnect.com"
        },
        {
          "Email": "roxanne.schweke@verizonconnect.com"
        },
        {
          "Email": "roxi.baros@verizonconnect.com"
        },
        {
          "Email": "rperez@verizonconnect.com"
        },
        {
          "Email": "ruben.alcazar@movildata.com"
        },
        {
          "Email": "ruben.zavala@verizonconnect.com"
        },
        {
          "Email": "rusbe.jean.claveria@verizonconnect.com"
        },
        {
          "Email": "ryan.friedman@verizonconnect.com"
        },
        {
          "Email": "ryan.jay.lorenzo@verizonconnect.com"
        },
        {
          "Email": "samantha.pessognelli@verizonconnect.com"
        },
        {
          "Email": "sami.awwad@verizonconnect.com"
        },
        {
          "Email": "samuel.dowdy@verizonconnect.com"
        },
        {
          "Email": "sandra.deseive@verizonconnect.com"
        },
        {
          "Email": "sandra.skontos@verizonconnect.com"
        },
        {
          "Email": "santiago.simental@verizonconnect.com"
        },
        {
          "Email": "sarah.crisp@verizonconnect.com"
        },
        {
          "Email": "sarah.musni@verizonconnect.com"
        },
        {
          "Email": "savita.soond@verizonconnect.com"
        },
        {
          "Email": "scott.greenwood@verizonconnect.com"
        },
        {
          "Email": "scott.heslinga@verizonconnect.com"
        },
        {
          "Email": "scott.scheibe@verizonconnect.com"
        },
        {
          "Email": "sean.duffy@verizonconnect.com"
        },
        {
          "Email": "sean.mahoney@verizonconnect.com"
        },
        {
          "Email": "sebastian.pekala@verizonconnect.com"
        },
        {
          "Email": "sfdc.integration@fleetmatics.com"
        },
        {
          "Email": "sfdc.integration@fleetmatics.com"
        },
        {
          "Email": "shane.dell@verizonconnect.com"
        },
        {
          "Email": "shane.vigan@verizonconnect.com"
        },
        {
          "Email": "shannon.quinlan@verizonconnect.com"
        },
        {
          "Email": "shari.west@verizonconnect.com"
        },
        {
          "Email": "sharon.colclough@verizonconnect.com"
        },
        {
          "Email": "shawanda.milligan@verizonconnect.com"
        },
        {
          "Email": "shawna.woodruff@verizonconnect.com"
        },
        {
          "Email": "shawn.james.hartman@verizonconnect.com"
        },
        {
          "Email": "shawn.walden@verizonconnect.com"
        },
        {
          "Email": "sheena.lauren.tamaca@verizonconnect.com"
        },
        {
          "Email": "sheri.rodriguez@verizonconnect.com"
        },
        {
          "Email": "shikema.gaskins@verizonconnect.com"
        },
        {
          "Email": "silver.palander@verizonconnect.com"
        },
        {
          "Email": "simar.singh@verizonconnect.com"
        },
        {
          "Email": "spencer.nieto@verizonconnect.com"
        },
        {
          "Email": "stacie.moring@verizonconnect.com"
        },
        {
          "Email": "stanley.shamon@verizonconnect.com"
        },
        {
          "Email": "stefanie.dunk@verizonconnect.com"
        },
        {
          "Email": "stefan.kajmowicz@verizonconnect.com"
        },
        {
          "Email": "stephanie.cruzrivas@verizonconnect.com"
        },
        {
          "Email": "stephanie.williams1@verizonconnect.com"
        },
        {
          "Email": "stephen.bottoms@verizonconnect.com"
        },
        {
          "Email": "steven.kalchik@verizonconnect.com"
        },
        {
          "Email": "stivel.palander@verizonconnect.com"
        },
        {
          "Email": "stiven.esho@verizonconnect.com"
        },
        {
          "Email": "supriya.sharma@verizonconnect.com"
        },
        {
          "Email": "suzanne.sellers@verizonconnect.com"
        },
        {
          "Email": "suzette.meyer@verizonconnect.com"
        },
        {
          "Email": "sylena.den.bakker@verizonconnect.com"
        },
        {
          "Email": "szjardeee.bowman.banks@verizonconnect.com"
        },
        {
          "Email": "tahmina.amiri@verizonconnect.com"
        },
        {
          "Email": "tamara.brandenberger@verizonconnect.com"
        },
        {
          "Email": "tanisha.sicardo@verizonconnect.com"
        },
        {
          "Email": "taylor.dediego@verizonconnect.com"
        },
        {
          "Email": "tedours.gelyana@verizonconnect.com"
        },
        {
          "Email": "terrand.johnson@verizonconnect.com"
        },
        {
          "Email": "terrell.whitehurst@verizonconnect.com"
        },
        {
          "Email": "thaira.tripp@verizonconnect.com"
        },
        {
          "Email": "thomas.pickering@verizonconnect.com"
        },
        {
          "Email": "timar.mcfarlane@verizonconnect.com"
        },
        {
          "Email": "tim.austin@verizonconnect.com"
        },
        {
          "Email": "tim.birmingham@verizonconnect.com"
        },
        {
          "Email": "timothy.chowaniec@verizonconnect.com"
        },
        {
          "Email": "timothy.seyffert@verizonconnect.com"
        },
        {
          "Email": "tobias.pietrow@verizonconnect.com"
        },
        {
          "Email": "todd.frank@verizonconnect.com"
        },
        {
          "Email": "toi.bridges@verizonconnect.com"
        },
        {
          "Email": "tony.benjamin@verizonconnect.com"
        },
        {
          "Email": "tony.williams@verizonconnect.com"
        },
        {
          "Email": "torrean.cleveland@verizonconnect.com"
        },
        {
          "Email": "tpalmer@verizonconnect.com"
        },
        {
          "Email": "travis.blair@verizonconnect.com"
        },
        {
          "Email": "trevor.kearney@verizonconnect.com"
        },
        {
          "Email": "trinette.wilder@verizonconnect.com"
        },
        {
          "Email": "trodrick@verizonconnect.com"
        },
        {
          "Email": "twatters@verizonconnect.com"
        },
        {
          "Email": "tyler.derer@verizonconnect.com"
        },
        {
          "Email": "tyler.piacella@verizonconnect.com"
        },
        {
          "Email": "tyrone.tate@verizonconnect.com"
        },
        {
          "Email": "vachon.colvin@verizonconnect.com"
        },
        {
          "Email": "valon.sadiku@verizonconnect.com"
        },
        {
          "Email": "valorie.callan@verizonconnect.com"
        },
        {
          "Email": "vanessa.means@verizonconnect.com"
        },
        {
          "Email": "vassily.mae.hamoy@verizonconnect.com"
        },
        {
          "Email": "vianna.brush@verizonconnect.com"
        },
        {
          "Email": "victor.colon@verizonconnect.com"
        },
        {
          "Email": "victoria.gibbs@verizonconnect.com"
        },
        {
          "Email": "victoria.sackel@verizonconnect.com"
        },
        {
          "Email": "victor.zegarra@verizonconnect.com"
        },
        {
          "Email": "vincent.caruso@verizonconnect.com"
        },
        {
          "Email": "warren.luke@verizonconnect.com"
        },
        {
          "Email": "wendy.herlich@verizonconnect.com"
        },
        {
          "Email": "wesley.haycraft@verizonconnect.com"
        },
        {
          "Email": "william.attebery@verizonconnect.com"
        },
        {
          "Email": "william.gabriel@verizonconnect.com"
        },
        {
          "Email": "william.grape@verizonconnect.com"
        },
        {
          "Email": "william.mcgee@verizonconnect.com"
        },
        {
          "Email": "william.munroe@verizonconnect.com"
        },
        {
          "Email": "willy.mondragon@verizonconnect.com"
        },
        {
          "Email": "wosbaldo.reyes@verizonconnect.com"
        },
        {
          "Email": "xaviera.mcnealy3@verizonconnect.com"
        },
        {
          "Email": "yadira.fernandez@verizonconnect.com"
        },
        {
          "Email": "yeager.baine@verizonconnect.com"
        },
        {
          "Email": "yvonne.marie.cabajes@verizonconnect.com"
        },
        {
          "Email": "zachary.hydeman@verizonconnect.com"
        },
        {
          "Email": "zayn.dornbrook@verizonconnect.com"
        },
        {
          "Email": "zita.simko@verizonconnect.com"
        },
        {
          "Email": "zoe.elders@verizonconnect.com"
        },
        {
          "Email": "zsolt.boros@verizonconnect.com"
        }
      ]
      const emailList = a.map(user => user.Email);


      for (const targetUserEmail of emailList) {
        console.log(`\n🚀 Starting Login As User for: ${targetUserEmail}`);

        if (await loginAsUser(user.Email, page)) {

        if (loginSuccess) {
          console.log(`✅ Logged in as ${targetUserEmail}`);
          await page.waitForTimeout(5000);

          const cookies = await getCookiesAfterLoginAsUser();
          const cookieString = formatCookiesForAPI(cookies);
          const timestamp = Date.now();
          const cookieData = {
            targetUser: targetUserEmail,
            cookies: cookies,
            cookieString: cookieString,
            extractedAt: new Date().toISOString(),
            cookieCount: cookies.length
          };

          fs.writeFileSync(`login_as_user_cookies_${targetUserEmail}_${timestamp}.json`, JSON.stringify(cookieData, null, 2));
          fs.writeFileSync(`cookie_string_${targetUserEmail}_${timestamp}.txt`, cookieString);

          console.log(`💾 Saved cookies for ${targetUserEmail}`);

          // Logout
          try {
            console.log('🚪 Logging out...');

            const logoutLink = page.locator('div.logout-btn >> div.btn-box >> a[href="/logout"]');

            // Ensure the logout link is visible and ready
            await logoutLink.waitFor({ state: 'visible', timeout: 8000 });

            // Scroll into view in case it's hidden offscreen
            await logoutLink.scrollIntoViewIfNeeded();

            // Click and wait for navigation
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle' }),
              logoutLink.click()
            ]);

            console.log(`👋 Logged out: ${targetUserEmail}`);
          } catch (logoutError) {
            console.warn(`⚠️ Logout failed for ${targetUserEmail}:`, logoutError.message);
            await page.screenshot({ path: `logout_error_${Date.now()}.png` });
          }



          // Go back to User Management
          await page.goto('https://vznconnect.gainsightcloud.com/v1/ui/usermanagement#/users', {
            waitUntil: 'networkidle'
          });
          await page.waitForTimeout(3000);
        } else {
          console.log(`❌ Failed to login as user: ${targetUserEmail}`);
        }
      }
    } else {
      console.warn('⚠️ Admin login may have failed. Current URL:', page.url());
    }
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    await page.screenshot({ path: `error_screenshot_${Date.now()}.png` });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('\n🎯 FINAL RESULTS:');
    console.log('✅ Script completed.');
    console.log('Check saved cookie files in current directory.');
    console.log('Closing browser...');
    await browser.close();
  }
})();


