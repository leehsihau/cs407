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


//sign up
let signupForm = document.querySelectorAll("#signup-form");
signupForm = addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user);
    window.location = "./map.html";
    // close the signup modal & reset form
  });
});


//sign in
if(window.location.pathname == '/index.html' || window.location.pathname=="/"){

let signinForm = document.querySelectorAll("#signin-form");

signinForm = document.getElementById("login").addEventListener("click", e => {
  console.log("dian")
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
    auth.signInWithEmailAndPassword(email, password).then(cred1 => {
      console.log(cred1.user);
      window.location = '/map.html';
    });
});
}
//sign out
  
function signOut(){
    let uid = getCurrentUserId();
    firebase.auth().signOut().then(function() {
      const db = firebase.database();
      db.ref('/userLocations/'+uid).remove();
      window.location = './index.html'
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    }


function getCurrentUserId() {
  var user = firebase.auth().currentUser;
  //console.log("current uid in func: "+user.uid);
  return user.uid;
}

//add allergens to a user, may expand for all settings
function addAllergens() {
  let uid = getCurrentUserId();
  const db = firebase.database();
  /**
  String teststring = "hello";
  firebase.database().ref('/userAllergens/'+uid).push(teststring);
  */
  //const allergen = document.getElementById('allergen0');
  for(let n = 0; n < 11; n++) {
  if(document.getElementById('allergen'+n).checked) {
    //firebase.database().ref('/userAllergens/'+uid).push(teststring);
    //db.ref(''+uid).add();//TODO
     firebase.firestore().collection('userAllergensList').doc(getCurrentUserId()).update({
        uid: getCurrentUserId(),
        timestamp: dateString,
        allergens: firebase.firestore.FieldValue.arrayUnion(document.getElementById('allergen'+n.toString()).value)
      }).catch(function (error) {
        console.log("error: " + error);
      });
  } else {
    firebase.firestore().collection('userAllergensList').doc(getCurrentUserId()).update({
        uid: getCurrentUserId(),
        timestamp: dateString,
        allergens: firebase.firestore.FieldValue.arrayRemove(document.getElementById('allergen'+n.toString()).value)
      }).catch(function (error) {
        console.log("error: " + error);
      });
  }
} 
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
      center: { lat: 40.454770, lng: -86.915700 },
      zoom: 6
    });
    infoWindow = new google.maps.InfoWindow;
    
}

var locationBefore;
function getLocationAndUpload(){
  var user = firebase.auth().currentUser;
  if(user!=null && locationBefore != undefined){
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            let pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            let timestamp = firebase.database.ServerValue.TIMESTAMP;
      
            const db = firebase.database();
            updates={};
            let uid = getCurrentUserId();

            var currentDate = new Date();

            var mili = currentDate.getMilliseconds();
            var seconds = currentDate.getSeconds();
            var minutes = currentDate.getMinutes();
            var hours = currentDate.getHours();
          var date = currentDate.getDate();
          var month = currentDate.getMonth(); //Be careful! January is 0 not 1
          var year = currentDate.getFullYear();

          var dateString = mili+"-" + seconds+"-"+minutes+"-"+hours+"-"+ date + "-" +(month + 1) + "-" + year;

            updates['/userLocations/'+uid+'/']={
              pos: pos,
              timestamp: dateString
            }
            if(locationBefore['lat'] != pos['lat'] && locationBefore['lng'] != pos['lng']){
              console.log("uploading: ", pos);
              console.log("location before", locationBefore);
              firebase.database().ref().update(updates);
              locationBefore=pos;
            }else if(locationBefore == null){
              console.log("location before is null");
            }
            else{
              console.log("same location");
            }

          });
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
      }
    }else{
      console.log("not signed in")
    }
}


var locations = firebase.database().ref('/userLocations');
const m = {};

function loadLocations(){
    let flag=true;
    locations.on('value', function(snapshot, context){
        //console.log("called");
        //console.log(snapshot);
        if(gmarkers.size!=0){
          for(const n of (Object(gmarkers.keys()))){
            gmarkers.get(n).setMap(null);
            gmarkers.delete(n);
            //m.delete(n);                
        }
      }
      console.log("lai le");
      locations.once('value', function(snapshot_) {
        snapshot_.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          var pos = childData['pos'];
              var marker = new google.maps.Marker({
                position: pos,
                title: childKey
              });
              marker.setMap(map);
              gmarkers.set(childKey, marker);
              console.log(gmarkers.size);
          }); 
        return;       
    })
  });
}
  /*snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            if((typeof m[childKey]!='undefined') && (m[childKey]['timestamp']===childData['timestamp'])){
              //console.log("don't print come in");
              //console.log("key: ", childKey);
              //console.log("m[childkey]: ", m[childKey]);
            }else{
              console.log("new added: ", childKey, "  ",childData);
              m[childKey] = childData;   
              var pos = childData['pos'];  
              if(gmarkers.get(childKey)!=undefined){
                gmarkers.get(childKey).setMap(null);
              }
              console.log("keys: ", Object.keys(m))
              var pass = false;
              var n_;
              for(const n of (Object.keys(m))){
                if(n===childKey){
                  console.log("pass");
                  pass=true;
                  n_=n;
                  break;
                }else{
                  console.log("not pass");
                  console.log(n, childKey)
                }
              }
              if(!pass){
                  gmarkers.get(n).setMap(null);
                  gmarkers.delete(n);
                  m.delete(n);
              }

              var marker = new google.maps.Marker({
                position: pos,
                title: childKey
              });
              marker.setMap(map);
              gmarkers.set(childKey, marker);

            }
            
              var pos = childData['pos'];
              var marker = new google.maps.Marker({
                position: pos,
                title: childKey
              });
              marker.setMap(map);
              gmarkers.set(childKey, marker);
              console.log(gmarkers.size);
            
        });*/
        //console.log("coming in:", m);}

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    console.log("uid: ",  firebase.auth().currentUser.uid);
    if (navigator.geolocation) {
        console.log("jin")
        navigator.geolocation.getCurrentPosition(function (position) {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const db = firebase.database();
          updates={};
          let uid = getCurrentUserId();
          var currentDate = new Date();

            var mili = currentDate.getMilliseconds();
            var seconds = currentDate.getSeconds();
            var minutes = currentDate.getMinutes();
            var hours = currentDate.getHours();
          var date = currentDate.getDate();
          var month = currentDate.getMonth(); //Be careful! January is 0 not 1
          var year = currentDate.getFullYear();

          var dateString = year + "-"+(month + 1) + "-"+ date + "-"+hours+":" +minutes+":"+ seconds+":"+mili;
          updates['/userLocations/'+uid+'/']={
            pos: pos,
            //timestamp: firebase.database.ServerValue.TIMESTAMP
            timestamp: dateString
          }
          firebase.database().ref().update(updates);
          locationBefore = pos;
          console.log("initial location");

        },function (error) {
            console.log("not support error")
        }, {timeout:10000});
      } else {
        // Browser doesn't support Geolocation
        console.log("not support")
        handleLocationError(false, infoWindow, map.getCenter());
      }
  }else{
    var user = firebase.auth().currentUser;
    if(user==null){
      executed=false
      console.log("location: ", window.location)
      //if(window.location.pathname == '/map.html'){
        //window.location = './index.html'
     // }

      console.log("logout");

    }
  }
});

setInterval(getLocationAndUpload, 2000);
loadLocations();
//saveMessagingDeviceToken();

if(window.location.pathname=='/map.html'){
  let signOutButtonElement = document.getElementById('signout');
  signOutButtonElement.addEventListener('click', signOut);
}
