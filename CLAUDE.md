okay in my codebase when you are making any change to the code write a comment that the change is made by Claude so I can understand what you changed and note : use functions only strict don’t use classes in the code strictly - you have @timelineController.js  which is the main migration file - try to clearly understand the code and do not make any assumptions in the code as it might cost me lot of euros so please try to control the hallucations in the code - basically this code is all about migration of data from old verizon gainsight to new instance in gainsight - so there is nearly 40 million data to migrate before that we are checking all the edge cases to make sure no errors in the code 
task : @playwright.js in this file we are able to login as a specific user for now we hardcoded one value to check the functionality but now what I want you to do is you should able to include this in the current code @timelineController.js - in this code file you can see this specific line “    // Handle user cache
    let userInfo;
    const authorEmail = entry.author?.email;
    if (authorEmail) {
      if (userCache[authorEmail]) {
        userInfo = userCache[authorEmail];
      } else {
        userInfo = await getUserIdByEmail(authorEmail, targetInstanceUrl, targetInstanceToken);
       //pLAYWRIGHT NEED TO write here
        userCache[authorEmail] = userInfo.GSID;
      }
    }
” Here we are Able to get the user info where you get the user email - in the playwright script as it is hardcoded which value to search so try to get the email from the script I mentioned search the same user email in the playwright script and it gives you 4 cookie ID of the specific user searched and you can see the file like this login_as_user_cookies_1751371414511.json which has 4 different cookies in it the format is wrong actual it should be (sid="asxs..”) so the complete cookie looks like in the bracket but currently it divided the name and value as different key value type but in the actual code when passing the code it should be given in a example format I have pasted it in the brackets -make sure my code should handle a scenario that if the out of 4 cookies in the file if first one doesn’t work try the e remaining 3 cookies in the list with same format in the brackets - next is if one is working there is no need to check the remaining ones try to cache that as in code when looping for different timeline activities if the same user email is found then it should able to get that from the cache memory instead of again running the playwright script make sure the code is written with brilliant memory power and in case when using the same user cookie from cache if it shows unthorized that means cookie token is expired so give it one more time to run if it still shows the error than agin it should run the playwright script  to get the specific user cookie and again store in cache by clearing the previous one and making sure to use the current one when the same user activates are called .  task 2 now we know how to get cookie by playwright and handle the cache brilliantly now you might have doubt where to pass the cookie for that in the @timelineController.js there is one function called createDraft in that there is headers inside it we have key called cookie paste the complete cookie there like in the example format I showed in the brackets - here how it looks in the codebase “async function createDraft(draftPayload, targetInstanceUrl, targetInstanceToken) {
  try {
    const response = await axios({
      method: 'post',
      url: `${targetInstanceUrl}/v1/ant/v2/activity/drafts`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken //paste here
      },
      data: JSON.stringify(draftPayload),
      maxBodyLength: Infinity
    });
” In the codebase if you check the in the line 1235 - we have author: {
        id: '1P010RM8DTS76UHHN4XY38M7XP5JT5JZS7IV',
        obj: "User",
In the place of id we should get the user id of the user we are using for the cookie as he is the person who is creating the timeline activity in the new instance by this it will only create the draft with the exact user who have created in the source -now in the target as we get the user cookie and update the id in. The draft as well in the ui it shows it is created by the XX person - make sure no hallucinations in the code it should be accurate - as we are passing the cookie we got from the playwright script in the createDraft cookie similar we should paste the same cookie when logging the activity you can find that example in the codebase you can find this here “    const draftId = await createDraft(draftPayload, targetInstanceUrl, targetInstanceToken);
    if (!draftId) {
      MigrationTracker.trackFailure(trackingData, entry.id, 'Draft creation failed', activityDetails);
      return { success: false, reason: 'Draft creation failed', entryId: entry.id };
    }

    const timelinePayload = { ...draftPayload, id: draftId };

    const postConfig = {
      method: 'post',
      url: `${targetInstanceUrl}/v1/ant/v2/activity`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken
      },
      data: JSON.stringify(timelinePayload),
      maxBodyLength: Infinity
    };
” in the place of 'Cookie': targetInstanceToken.  remove this targetInstanceToken and replace this with the token playwright got us   task 3 : try to include the cache mechanism for cookie and also check the complete code cache if any improvement can be made or check the existing one is better   note: Don’t use any hallucinations if you are not sure about something than try to keep a comment in the codebase to review I will check whether I can provide something -make sure if you are not sure don’t change the code just stop and ask me and also if you are running into multiple errors just don’t crash yourself and create a simple files as it is not feasible solution -if any test files are added please try to delete if not needed before delete just ask me do not delete without permissions