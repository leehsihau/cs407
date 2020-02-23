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
if (window.location.pathname == '/index.html' || window.location.pathname == "/") {

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

function signOut() {
  let uid = getCurrentUserId();
  firebase.auth().signOut().then(function () {
    const db = firebase.database();
    db.ref('/userLocations/' + uid).remove();
    window.location = './index.html'
    // Sign-out successful.
  }).catch(function (error) {
    // An error happened.
  });
}


function getCurrentUserId() {
  var user = firebase.auth().currentUser;
  //console.log("current uid in func: "+user.uid);
  return user.uid;
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
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP

  });
  var myoverlay = new google.maps.OverlayView();
  myoverlay.draw = function () {
    this.getPanes().markerLayer.id = 'markerLayer';
  };
  myoverlay.setMap(map);
  infoWindow = new google.maps.InfoWindow;

}


function deleteFile(pathToFile, fileName) {
  const ref = firebase.storage().ref(pathToFile);
  const childRef = ref.child(fileName);
  childRef.delete()
}


var locationBefore;
function getLocationAndUpload() {
  var user = firebase.auth().currentUser;
  if (user != null) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function (position) {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        let timestamp = firebase.database.ServerValue.TIMESTAMP;

        const db = firebase.database();
        updates = {};
        let uid = getCurrentUserId();

        var currentDate = new Date();
        var mili = currentDate.getMilliseconds();
        var seconds = currentDate.getSeconds();
        var minutes = currentDate.getMinutes();
        var hours = currentDate.getHours();
        var date = currentDate.getDate();
        var month = currentDate.getMonth(); //Be careful! January is 0 not 1
        var year = currentDate.getFullYear();

        var dateString = mili + "-" + seconds + "-" + minutes + "-" + hours + "-" + date + "-" + (month + 1) + "-" + year;

        updates['/userLocations/' + uid + '/'] = {
          pos: pos,
          timestamp: dateString
        }
        console.log("uploading: ", pos);
        firebase.database().ref().update(updates);


      }, function (err) {
        console.log("err", err);
      },
        {
          enableHighAccuracy: true
        });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  } else {
    console.log("not signed in")
  }

}

function saveImageMessage(file) {
  var currentDate = new Date();
  var mili = currentDate.getMilliseconds();
  var seconds = currentDate.getSeconds();
  var minutes = currentDate.getMinutes();
  var hours = currentDate.getHours();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();

  var dateString = mili + "-" + seconds + "-" + minutes + "-" + hours + "-" + date + "-" + (month + 1) + "-" + year;
  // TODO 9: Posts a new image as a message.
  const firestore = firebase.firestore();
  const settings = {
    timestampsInSnapshots: true
  };
  firestore.settings(settings);


  const listRef = firebase.storage().ref().child(getCurrentUserId());
  listRef.listAll()
    .then(fileRef => {
      fileRef.items.forEach(function (imageRef) {
        // And finally display them
        imageRef.delete();
      });
      //fileRef.delete();

    })
    .catch(error => {
      console.log("shabinima: ", error);
    });



  var filePath = firebase.auth().currentUser.uid + '/' + file.name;
  firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
    // 3 - Generate a public URL for the file.
    return fileSnapshot.ref.getDownloadURL().then((url) => {
      // 4 - Update the chat message placeholder with the image’s URL.

      firebase.firestore().collection('usersProfilePics').doc(getCurrentUserId()).set({
        uid: getCurrentUserId(),
        timestamp: dateString,
        imageUrl: url,
        storageUri: fileSnapshot.metadata.fullPath
      }).catch(function (error) {
        console.log("error: " + error);
      });
    });
  });




/*
  firebase.firestore().collection('usersProfilePics').doc(getCurrentUserId()).set({
    uid: getCurrentUserId(),
    timestamp: dateString
  }).then(function (messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image’s URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        }).catch(function (error) {
          console.log("error: " + error);
        });
      });
    });
  }).catch(function (error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
*/
}




var locations = firebase.database().ref('/userLocations');
const m = {};
const profilePics = {};

//load users uploaded profile prictures into array
function loadProfilePics() {
  var query = firebase.firestore().collection('usersProfilePics');

  // Start listening to the query.
  query.onSnapshot(function (snapshot) {
    console.log("called");
    snapshot.docChanges().forEach(function (change) {
      var message = change.doc.data();
      console.log("someone just uploaded their profilePic");
      console.log("imageUrl", message.imageUrl);
      if (message.imageUrl != undefined) {
        profilePics[message.uid] = message.imageUrl;
      }
    });
    locations.once('value', function (snapshot_) {
      snapshot_.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var pos = childData['pos'];
        if (profilePics[childKey] != undefined) {
          gmarkers.get(childKey).setMap(null);
          gmarkers.delete(childKey);
          console.log("shabi", google.maps.SymbolPath.CIRCLE);
          var marker = new google.maps.Marker({
            position: pos,
            icon: {
              url: profilePics[childKey],
              scaledSize: new google.maps.Size(49, 40)
            },


            id: "profilePic",
            title: childKey,
            optimized: false

          });
          google.maps.event.addListener(marker, "click", function () {
            var marker = this;
            alert("ID is: " + this.id);
          });
          //marker.metadata = {id: "profilePic"};
          marker.setMap(map);
          gmarkers.set(childKey, marker);
        }
      });
      return;
    })
  });
}

function loadLocations() {
  let flag = true;
  locations.on('value', function (snapshot, context) {
    //console.log("called");
    //console.log(snapshot);
    if (gmarkers.size != 0) {
      for (const n of (Object(gmarkers.keys()))) {
        gmarkers.get(n).setMap(null);
        gmarkers.delete(n);
        //m.delete(n);                
      }
    }
    console.log("lai le");
    locations.once('value', function (snapshot_) {
      snapshot_.forEach(function (childSnapshot) {
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




firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log("uid: ", firebase.auth().currentUser.uid);




    if (navigator.geolocation) {
      console.log("jin")
      navigator.geolocation.getCurrentPosition(function (position) {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const db = firebase.database();
        updates = {};
        let uid = getCurrentUserId();
        var currentDate = new Date();

        var mili = currentDate.getMilliseconds();
        var seconds = currentDate.getSeconds();
        var minutes = currentDate.getMinutes();
        var hours = currentDate.getHours();
        var date = currentDate.getDate();
        var month = currentDate.getMonth(); //Be careful! January is 0 not 1
        var year = currentDate.getFullYear();

        var dateString = year + "-" + (month + 1) + "-" + date + "-" + hours + ":" + minutes + ":" + seconds + ":" + mili;
        updates['/userLocations/' + uid + '/'] = {
          pos: pos,
          //timestamp: firebase.database.ServerValue.TIMESTAMP
          timestamp: dateString
        }
        firebase.database().ref().update(updates);
        locationBefore = pos;
        console.log("initial location");
        const firestore = firebase.firestore();
        const settings = {
          timestampsInSnapshots: true
        };
        firestore.settings(settings);
        firebase.firestore().collection('usersProfilePics').doc('flag').set({
          uid: 1,
          timestamp: dateString
        })



      }, function (error) {
        console.log("not support error")
      }, { timeout: 10000 });
    } else {
      // Browser doesn't support Geolocation
      console.log("not support")
      handleLocationError(false, infoWindow, map.getCenter());
    }
  } else {
    var user = firebase.auth().currentUser;
    if (user == null) {
      executed = false
      console.log("location: ", window.location)
      //if(window.location.pathname == '/map.html'){
      //window.location = './index.html'
      // }

      console.log("logout");

    }
  }
});

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  saveImageMessage(file);

}

//setInterval(getLocationAndUpload, 5000);
loadLocations();
loadProfilePics();
//saveMessagingDeviceToken();

/**
 * DOM elements
 */
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');

if (window.location.pathname == '/map.html') {
  let signOutButtonElement = document.getElementById('signout');
  signOutButtonElement.addEventListener('click', signOut);
}

// Events for image upload.
imageButtonElement.addEventListener('click', function (e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);