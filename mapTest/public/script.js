var firebaseConfig = {
    apiKey: "AIzaSyB5ktXembdAM9WmU8rFXsSiXdOBFTBQc-U",
    authDomain: "lunchmate-9b46b.firebaseapp.com",
    databaseURL: "https://lunchmate-9b46b.firebaseio.com",
    projectId: "lunchmate-9b46b",
   // storageBucket: "project-id.appspot.com",
   // messagingSenderId: "sender-id",
   appId: "1:13075930277:web:a7c6eeaf25ead0124c414c"
  };
  let map, infoWindow;
let gmarkers = new Map();//array for google map markers 

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


function saveMessagingDeviceToken() {
    // TODO 10: Save the device token in the realtime datastore
    firebase.messaging().getToken().then(function (currentToken) {
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        firebase.database().ref("/fcmTokens").push(currentToken);
        //firebase.database().ref('/fcmTokens').child(currentToken)
        // .set(firebase.auth().currentUser.uid);
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    }).catch(function (error) {
      console.error('Unable to get messaging device token:', error);
    });
  }



function initMap() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 6
    });
    infoWindow = new google.maps.InfoWindow;
    
}


function getLocationAndUpload(){
    console.log("executed");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
    
          /*var user = firebase.auth().currentUser;
          let username = "";
          if (user.isAnonymous) {
            username = "Anonymous";
          } else {
            username = getUserName();
          }*/
          const db = firebase.database();
          firebase.database().ref('users/').push({
//            name: username,
  //          profilePicUrl: getProfilePicUrl(),
    //        uid: getCurrentUserId(),
            pos: pos,
            timestamp: firebase.database.ServerValue.TIMESTAMP
          }).catch(function (error) {
            console.error('Error writing location to Realtime Database:', error);
          });
        }, function () {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
}


var locations = firebase.database().ref('/users');
function loadLocations(){
    locations.on('value', function(snapshot, context){
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            console.log("coming in", childData);

          });
    })
}

setInterval(getLocationAndUpload, 2000);
loadLocations();
saveMessagingDeviceToken();