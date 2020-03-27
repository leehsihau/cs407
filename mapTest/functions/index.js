const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp(); 

exports.sendNotifications = functions.database.ref('/users').onWrite(
    async (snapshot)=>{
        let tokens = new Array();

        const data = snapshot.after.val();
        const allTokens = admin.database().ref().child('/fcmTokens');
        const payload = {
            // NOTE: The 'data' object is inside payload, not inside notification
            'data': { 
                  'personSent': data.toString()
            }
          };

        allTokens.once("value", function(snapshot){
            snapshot.forEach(function(child) {
                //console.log(child.key+": "+child.val());
                tokens.push(child.val());
                console.log("len: ", tokens.toString())
            })
          // Send notifications to all tokens.
            const response = admin.messaging().sendToDevice(tokens, payload);
            cleanupTokens(response, tokens);
            console.log('Notifications have been sent and tokens cleaned up.');
        })
        console.log("fuck you");

    });



// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    const tokensDelete = [];
    response.results.forEach((result, index) => {
      const error = result.error;
      if (error) {
        console.error('Failure sending notification to', tokens[index], error);
        // Cleanup the tokens who are not registered anymore.
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          const deleteTask = admin.firestore().collection('messages').doc(tokens[index]).delete();
          tokensDelete.push(deleteTask);
        }
      }
    });
    return Promise.all(tokensDelete); 
  }

  exports.sendCouponOnPurchase = functions.analytics.event('login').onLog((event) => {
    const user = event.user;
    const uid = user.userId; // The user ID set via the setUserId API.
    console.log("zhen tan ma de sha bi");
  
  });