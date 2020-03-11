/*var firebaseConfig = {
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
  if (!password.match(/[a-zA-Z0-9]/)) {
    alert("contains special character");
    window.location('./createaccount.html')
  }
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user);
    window.location = "./map.html";
    // close the signup modal & reset form
  }).catch(function (err) {
    alert(err)
  });
});

//forget password
if (window.location.pathname == '/forgetpassword.html') {

  let forgetForm = document.querySelectorAll("#forget-form");
  forgetForm = document.getElementById("submit_forget").addEventListener("click", e => {
    console.log("forget")
    e.preventDefault();
    const email = document.getElementById("email").value;
    console.log("email: ", email);
    auth.sendPasswordResetEmail(email).then(cred1 => {
      //console.log(cred1.user);
      alert("Reset password email has been sent to your email address!");
      //window.location = './index.html';
    });
  });
}

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

//sign in google
//google login
if (window.location.pathname == '/index.html' || window.location.pathname == "/") {

  var signInButtonElement = document.getElementById('sign-in');
  signInButtonElement.addEventListener('click', signInGoogle);
  function signInGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("google");
      window.location = '/map.html';
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }


}*/


let map, infoWindow;
let gmarkers = new Map();//array for google map markers
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
    center: { lat: 40.426764, lng: -86.919632 },
    zoom: 15,
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
  /*const settings = {
    timestampsInSnapshots: true
  };
  firestore.settings(settings);*/


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
          console.log(profilePics[childKey]);
          gmarkers.get(childKey).setMap(null);
          gmarkers.delete(childKey);
          var marker = new google.maps.Marker({
            position: pos,
            icon: {
              url: profilePics[childKey],
              scaledSize: new google.maps.Size(49, 40)
            },


            id: childKey,
            title: childKey,
            optimized: false

          });

          var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h2 id="firstHeading" class="firstHeading">User Info</h2>' +
            '<div id="bodyContent">' + childKey +
            '<p><b>Favorite Food List: </b></p>' +
            '</div>' +
            '</div>';
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });
          google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
          });

          /*google.maps.event.addListener(marker, "click", function () {
            var marker = this;
            alert("ID is: " + this.id);
          });*/
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

        var contentString = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<h2 id="firstHeading" class="firstHeading">User Info</h2>' +
          '<div id="bodyContent">' + childKey +
          '<p><b>Favorite Food List: </b></p>' +
          '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="friendStatus(this.id)" id=' + childKey + '> Click me</button>';
        '</div>' +
          '</div>';

        var marker = new google.maps.Marker({
          position: pos,
          icon: {
            url: profilePics[childKey],
            scaledSize: new google.maps.Size(49, 40)
          },


          id: childKey,
          title: childKey,
          optimized: false

        });
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function () {
          infowindow.open(map, marker);
        });
        marker.setMap(map);
        gmarkers.set(childKey, marker);
        console.log(gmarkers.size);
      });
      return;
    })
  });
}

function acceptFriend(friendId){
  var currentDate = new Date();
  var mili = currentDate.getMilliseconds();
  var seconds = currentDate.getSeconds();
  var minutes = currentDate.getMinutes();
  var hours = currentDate.getHours();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();

  var dateString = mili + "-" + seconds + "-" + minutes + "-" + hours + "-" + date + "-" + (month + 1) + "-" + year;
  console.log("accpeted: ",friendId);
  updates = {};
  var uid = getCurrentUserId();
  updates['/friendList/' + uid + '/' + friendId] = {
    friendStatus: 1,
    timestamp: dateString
  }
  firebase.database().ref().update(updates);

}

function rejectFriend(friendId){
  console.log("rejected", friendId);
  console.log('/friendList/'+getCurrentUserId()+'/'+friendId);
  var friendList = firebase.database().ref('/friendList/'+getCurrentUserId()).child(friendId).remove();
  var div = friendsDir.querySelector('#'+friendId);
  div.parentNode.removeChild(div);
  console.log(div.innerHTML);
}


function friendStatus(friendId) {



  console.log("send friend request: ", friendId);
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

  /*
  * -1: Not currently a friend
  * 0: Friend request is sent
  * 1: Friend request is accepted 
  */

  updates = {};
  update = {};
  update[uid] = 0;
  updates['/friendList/' + friendId + '/' + uid] = {
    friendStatus: 0,
    timestamp: dateString
  }
  firebase.database().ref().update(updates);
  //var friendList = firebase.database().ref('/friendList/' + uid + '/');
  var friendList = firebase.database().ref('/friendList/').child(uid);

  friendList.on('value', function (snapshot, context) {
    friendsDir.innerHTML='';
    snapshot.forEach(function (childSnapshot) {
      //if (childSnapshot.key == uid) {
      console.log("friend request: ", childSnapshot.key);
      //var node = document.createElement("LI");                 // Create a <li> node

      //node.appendChild(friendRequestPlaceHolder);
      //friendsDir.appendChild(node);
      var isFriend = childSnapshot.val()['friendStatus'];
      var friendRequestPlaceHolder='';
      if(isFriend){
         friendRequestPlaceHolder = '<div class="fb" id='+ childSnapshot.key +'>' +
        '<img src="./logo.png" height="50" width="50" alt="Image of woman">' +
        '<p id="info"><b>'+ childSnapshot.key +'</b> <br></p>' +
        '</div>' +
        '</div>'
      }else{
         friendRequestPlaceHolder = '<div class="fb" id='+ childSnapshot.key +'>' +
        '<img src="./logo.png" height="50" width="50" alt="Image of woman">' +
        '<p id="info"><b>'+ childSnapshot.key +'</b> <br></p>' +
        '<div id="button-block" class="friendRequests">' +
        '<div class = "confirmRequest" onclick="acceptFriend(this.id)" id='+childSnapshot.key+'>Confirm</div>' +
        '<div class = "deleteRequest" onclick="rejectFriend(this.id)" id='+childSnapshot.key+'>Delete</div>' +
        '</div>' +
        '</div>'
      }
      
      friendsDir.innerHTML += friendRequestPlaceHolder;

    });
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
        /*const settings = {
          timestampsInSnapshots: true
        };
        firestore.settings(settings);*/
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
var friendsDir = document.getElementById('friendsDir');

var settings = document.getElementById("settingButton");

if (window.location.pathname == '/map.html') {
  let signOutButtonElement = document.getElementById('signout');
  signOutButtonElement.addEventListener('click', signOut);
  settings.addEventListener('click', function () {
    window.location = "./weightAndSettingsMngr.html";
  });
}

// Events for image upload.
imageButtonElement.addEventListener('click', function (e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

