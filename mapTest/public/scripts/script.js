let map, infoWindow;
let gmarkers = new Map(); //array for google map markers

function checkLogIn() {
  var uid = getCurrentUserId();
  if (uid == null) {
    window.location = "./index.html";
  }
}

function onDeleteAccount() {
  document.getElementById("delete1").addEventListener("click", deleteAccount);
}

function deleteAccount() {
  var user = firebase.auth().currentUser;
  console.log(user);

  if(confirm("Are you sure you want to delete your account?")){
    /*console.log("Deleted");*/
    user
    .delete()
    .then(function() {
      // User deleted.

      window.location("./createaccount.html");
    })
    .catch(function(error) {
      console.log(error);
      // An error happened.
    });
  }else{
    /*console.log("Cancelled");*/
  }
}

//sign out
function signOut() {
  let uid = getCurrentUserId();
  firebase
    .auth()
    .signOut()
    .then(function() {
      const db = firebase.database();
      db.ref("/userLocations/" + uid).remove();
      window.location = "./index.html";
      // Sign-out successful.
    })
    .catch(function(error) {
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
  firebase
    .messaging()
    .getToken()
    .then(function(currentToken) {
      if (currentToken) {
        console.log("Got FCM device token:", currentToken);
        firebase
          .database()
          .ref("/fcmTokens")
          .push(currentToken);
        //firebase.database().ref('/fcmTokens').child(currentToken)
        // .set(firebase.auth().currentUser.uid);
      } else {
        // Need to request permissions to show notifications.
        requestNotificationsPermissions();
      }
    })
    .catch(function(error) {
      console.error("Unable to get messaging device token:", error);
    });
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: { lat: 40.426764, lng: -86.919632 },
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  var myoverlay = new google.maps.OverlayView();
  myoverlay.draw = function() {
    this.getPanes().markerLayer.id = "markerLayer";
  };
  myoverlay.setMap(map);
  infoWindow = new google.maps.InfoWindow();
}

function deleteFile(pathToFile, fileName) {
  const ref = firebase.storage().ref(pathToFile);
  const childRef = ref.child(fileName);
  childRef.delete();
}

var locationBefore;
function getLocationAndUpload() {
  var user = firebase.auth().currentUser;
  if (user != null) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        function(position) {
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

          var dateString =
            mili +
            "-" +
            seconds +
            "-" +
            minutes +
            "-" +
            hours +
            "-" +
            date +
            "-" +
            (month + 1) +
            "-" +
            year;

          var user = firebase.auth().currentUser;
          var email = user.email;
          var name = email.substring(0, email.indexOf("@"));
          var shown = 1;
          if(document.getElementById("privacy0").checked == true) {
            shown = 0;
          }
          console.log("name: ", name);
          updates["/userLocations/" + uid + "/"] = {
            pos: pos,
            timestamp: dateString,
            username: name,
            isShown: shown
          };
          console.log("uploading: ", pos);
          firebase
            .database()
            .ref()
            .update(updates);
        },
        function(err) {
          console.log("err", err);
        },
        {
          enableHighAccuracy: true
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  } else {
    console.log("not signed in");
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

  var dateString =
    mili +
    "-" +
    seconds +
    "-" +
    minutes +
    "-" +
    hours +
    "-" +
    date +
    "-" +
    (month + 1) +
    "-" +
    year;
  
  // TODO 9: Posts a new image as a message.
  const firestore = firebase.firestore();
  /*const settings = {
    timestampsInSnapshots: true
  };
  firestore.settings(settings);*/

  const listRef = firebase
    .storage()
    .ref()
    .child(getCurrentUserId());
  listRef
    .listAll()
    .then(fileRef => {
      fileRef.items.forEach(function(imageRef) {
        // And finally display them
        imageRef.delete();
      });
      //fileRef.delete();
    })
    .catch(error => {
      console.log("shabinima: ", error);
    });

  var filePath = firebase.auth().currentUser.uid + "/" + file.name;
  firebase
    .storage()
    .ref(filePath)
    .put(file)
    .then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then(url => {
        // 4 - Update the chat message placeholder with the image’s URL.

        firebase
          .firestore()
          .collection("usersProfilePics")
          .doc(getCurrentUserId())
          .set({
            uid: getCurrentUserId(),
            timestamp: dateString,
            imageUrl: url,
            storageUri: fileSnapshot.metadata.fullPath
          })
          .catch(function(error) {
            console.log("error: " + error);
          });
      });
    });
}

const showPro = [];
var showPro_index = 0;

function showProfile(){
  const db = firebase.firestore();
  showPro.length = 0;
  showPro_index = 0;

  db.collection("privacySettings").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        if(doc.data().privacy2 == true){
          showPro[showPro_index] = doc.data().uid;
          showPro_index++;
        }
    });
});
}

showProfile();

var locations = firebase.database().ref("/userLocations");

const m = {};
const profilePics = {};

//load users uploaded profile prictures into array
function loadProfilePics() {
  var query = firebase.firestore().collection("usersProfilePics");

  // Start listening to the query.
  query.onSnapshot(function(snapshot) {
    console.log("called");
    snapshot.docChanges().forEach(function(change) {
      var message = change.doc.data();
      //console.log("someone just uploaded their profilePic");
      //console.log("imageUrl", message.imageUrl);
      if (message.imageUrl != undefined) {
        profilePics[message.uid] = message.imageUrl;
      }
    });
    locations.once("value", function(snapshot_) {
      snapshot_.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var pos = childData["pos"];
        if(childData["isShown"] == 0) {
          if(gmarkers.get(childKey) != undefined) {
            gmarkers.get(childKey).setMap(null);
          }
          gmarkers.delete(childKey);
        } 
        if(childData["isShown"] == 1) {
          if (profilePics[childKey] != undefined) {
            console.log(profilePics[childKey]);
            if(gmarkers.get(childKey) != undefined) {
              gmarkers.get(childKey).setMap(null);
            }
            gmarkers.delete(childKey);
            var marker = new google.maps.Marker({
              position: pos,
              icon: {
                url: profilePics[childKey],
                scaledSize: new google.maps.Size(49, 40)
              },

              //animation: google.maps.Animation.DROP,
              id: childKey,
              title: childKey,
              optimized: false
            });
            var username = childData["username"];
            var user = "&quot;" + childSnapshot.val()["username"] + "&quot;";

            var contentString =
              '<div id="content">' +
              '<div id="siteNotice">' +
              "</div>" +
              '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
              '<div id="bodyContent">' +
              username +
              "<p><b>Favorite Food List: </b></p>" +
              '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="friendStatus(this.id)" id=' +
              childKey +
              "> friend me</button><p></p>" +
              '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="blockPerson(this.id,'+
              user +
              ')" id=' +
              childKey +
              "> Block</button>";
            "</div>" + "</div>";

            if(showPro.indexOf(childKey) != -1){
              contentString =
              '<div id="content">' +
              '<div id="siteNotice">' +
              "</div>" +
              '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
              '<div id="bodyContent">' +
              "<p><b>Sorry, it seems like this user has decided not to share their profile info at this time</b></p>" +
              "</div>" + "</div>";
            }

            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });
            google.maps.event.addListener(marker, "click", function() {
              infowindow.open(map, marker);
            });

            marker.setMap(map);
            gmarkers.set(childKey, marker);
          } else{
            profilePics[childKey] = "../profile_placeholder.png";
            if(document.getElementById("privacy3").checked == false){
            gmarkers.get(childKey).setMap(null);
            gmarkers.delete(childKey);
            
            var marker = new google.maps.Marker({
              position: pos,
              icon: {
                url: ".. /profile_placeholder.png",
                scaledSize: new google.maps.Size(49, 40)
              },

              // animation: google.maps.Animation.DROP,
              id: childKey,
              title: childKey,
              optimized: false
            });
            var username = childData["username"];
            var username = "&quot;" + childSnapshot.val()["username"] + "&quot;";
            
            var contentString =
              '<div id="content">' +
              '<div id="siteNotice">' +
              "</div>" +
              '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
              '<div id="bodyContent">' +
              username +
              "<p><b>Favorite Food List: </b></p>" +
              '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="friendStatus(this.id)" id=' +
              childKey +
              "> friend me</button><p></p>" +
              '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="blockPerson(this.id,'+
              user +
              ')" id=' +
              childKey +
              "> Block</button>";
            "</div>" + "</div>";

            if(showPro.indexOf(childKey) != -1){
              contentString =
              '<div id="content">' +
              '<div id="siteNotice">' +
              "</div>" +
              '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
              '<div id="bodyContent">' +
              "<p><b>Sorry, it seems like this user has decided not to share their profile info at this time</b></p>" +
              "</div>" + "</div>";
            }
            
            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });
            google.maps.event.addListener(marker, "click", function() {
              infowindow.open(map, marker);
            });

            
            loadBlockList();
            marker.setMap(map);
            gmarkers.set(childKey, marker);
          }
          }
        }
        loadFriends();
      });
      return;
    });
  });
}
function removeblockPerson(childval) {
  //console.log("/blockList/" + getCurrentUserId() + "/" + childval);
  firebase
  .database()
  .ref("/blockList/" + childval)
  .child(childval)
  .remove()
}


function blockPerson(user, username) {
  var uid = getCurrentUserId();
  var pushRef = firebase.database().ref('/blockList/' + getCurrentUserId());
  var pRef = pushRef.child(uid);
  update = {};
  update["/blockList/" + getCurrentUserId()] = user.value;
  pRef.set({
    username:username,
    userid:user,
    blockedBy:uid
  });

  var pushRef1 = firebase.database().ref('/blockList/' + user);
  var pRef1 = pushRef1.child(user);
  update1 = {};
  update1["/blockList/" + user] = user.value;
  pRef1.set({
    username:username,
    userid:user,
    blockedBy:uid
  });
}


function loadBlockList() {
  var uid = getCurrentUserId();
  var flag = 0;
  var blockList = firebase
    .database()
    .ref("/blockList/")
    .child(uid);
  blockList.once("value", function(snapshot, context) {
    document.getElementById("blockList").innerHTML = "";
    snapshot.forEach(function(child) {
      var person = child.val()['username'];
      var personid = child.val()['userid'];
      var blockBy = child.val()['blockedBy'];
      if(blockBy == uid) {
        console.log("disappear",personid);
        if(gmarkers.get(personid) != undefined) {
          gmarkers.get(personid).setMap(null);
        }
        gmarkers.delete(personid);
      }
      else if(blockBy != uid && personid == uid) {
        console.log("disappear",blockBy);
        if(gmarkers.get(blockBy) != undefined) {
          gmarkers.get(blockBy).setMap(null);
        }
        gmarkers.delete(blockBy);
      }
      if(blockBy == uid) {
        document.getElementById("blockList").innerHTML +=
        '<li>' + person + '<span class="close" onclick ="removeblockPerson(\''+ child.key +'\'), removeblockPerson(\''+ personid +'\'), window.onbeforeunload = null, window.location.reload();">&times;</span></li>';
      }
    });
  });
  blockList.on("value", function(snapshot, context) {
    document.getElementById("blockList").innerHTML = "";
    snapshot.forEach(function(child) {
      var childKey = snapshot.key;
      var personid = child.val()['userid'];
      var blockBy = child.val()['blockedBy'];
      if(blockBy == uid) {
        if(gmarkers.get(personid) != undefined) {
          gmarkers.get(personid).setMap(null);
        }
        gmarkers.delete(personid);
        console.log("disappear",personid);
      }
      else if(blockBy != uid && personid == uid) {
        if(gmarkers.get(blockBy) != undefined) {
          gmarkers.get(blockBy).setMap(null);
        }
        gmarkers.delete(blockBy);
        console.log("disappear",blockBy);
      }
      var person = child.val()['username'];
      if(blockBy == uid) {
        document.getElementById("blockList").innerHTML +=
        '<li>' + person + '<span class="close" onclick ="removeblockPerson(\''+ child.key +'\'), removeblockPerson(\''+ personid +'\'), window.onbeforeunload = null, window.location.reload();">&times;</span></li>';
      }
    });
  });

  var blockList1 = firebase
  .database()
  .ref("/blockList/");
  blockList1.on("value", function(snapshot, context) {
  
    snapshot.forEach(function(child) {
      var childKey = snapshot.key;
      var personid = child.val()['userid'];
      console.log("disappear",personid);
      if(gmarkers.get(personid) != undefined) {
        gmarkers.get(personid).setMap(null);
      }
      gmarkers.delete(personid);
      var person = child.val()['username'];
    });
  });

  return flag;
}

function loadLocations() {
  let flag = true;
  locations.on("value", function(snapshot, context) {
    //console.log("called");
    //console.log(snapshot);
    if (gmarkers.size != 0) {
      for (const n of Object(gmarkers.keys())) {
        gmarkers.get(n).setMap(null);
        gmarkers.delete(n);
        //m.delete(n);
      }
    }
    console.log("lai le");
    locations.once("value", function(snapshot_) {
      snapshot_.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var pos = childData["pos"];
        var user = "&quot;" + childSnapshot.val()["username"] + "&quot;";
        
        
            if(childData["isShown"] == 0) {
              if(gmarkers.get(childKey) != undefined) {
                gmarkers.get(childKey).setMap(null);
              }
              gmarkers.delete(childKey);
            }
         
            if(childData["isShown"] == 1) {
              var contentString =
                '<div id="content">' +
                '<div id="siteNotice">' +
                "</div>" +
                '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
                '<div id="bodyContent">' +
                childData["username"] +
                "<p><b>Favorite Food List: </b></p>" +
                '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="friendStatus(this.id)" id=' +
                childKey +
                "> friend me</button><p></p>" +
                '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="blockPerson(this.id,'+
                user +
                ')" id=' +
                childKey +
                " +> Block</button>";
                "</div>" + "</div>"
              ;
  
              if(showPro.indexOf(childKey) != -1){
                contentString =
                  '<div id="content">' +
                  '<div id="siteNotice">' +
                  "</div>" +
                  '<h4 id="firstHeading" class="firstHeading">User Info</h4>' +
                  '<div id="bodyContent">' +
                  "<p><b>Sorry, it seems like this user has decided not to share their profile info at this time</b></p>" +
                  "</div>" + "</div>"
                ;
              }
  
              var marker = new google.maps.Marker({
                position: pos,
                // animation: google.maps.Animation.DROP,
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
              marker.addListener("click", function() {
                infowindow.open(map, marker);
              });
              loadBlockList();
              marker.setMap(map);
              gmarkers.set(childKey, marker);
              console.log(gmarkers.size);
            } 
            if(document.getElementById("privacy3").checked == true && profilePics[childKey] == "../profile_placeholder.png"){
              if(gmarkers.get(childKey) != undefined) {
                gmarkers.get(childKey).setMap(null);
              }
              gmarkers.delete(childKey);
            } 
      });
      return;
    });
  });
}

function loadFavoriteFoodList() {
  var uid = getCurrentUserId();
  var favoriteFoodList = firebase
    .database()
    .ref("/favoriteFoodList/")
    .child(uid);
  favoriteFoodList.once("value", function(snapshot, context) {
    document.getElementById("favFoodContainer").innerHTML = "";
    snapshot.forEach(function(child) {
      food = child.val()['food'];
      document.getElementById("favFoodContainer").innerHTML +=
      '<li>' + food + '<span class="close" onclick ="removeFavFood(\''+ child.key +'\');">&times;</span></li>';
      console.log("fav food", child.val()["food"]);
    });
  });
  favoriteFoodList.on("value", function(snapshot, context) {
    document.getElementById("favFoodContainer").innerHTML = "";
    snapshot.forEach(function(child) {
      var food = child.val()['food'];
      document.getElementById("favFoodContainer").innerHTML +=
      '<li>' + food + '<span class="close" onclick ="removeFavFood(\''+ child.key +'\');">&times;</span></li>';
      console.log("fav food", child.val()["food"]);
    });
  });
}

function removeFavFood(childval) {
  console.log("/friendList/" + getCurrentUserId() + "/" + childval);
  var favoriteFoodList = firebase
  .database()
  .ref("/favoriteFoodList/" + getCurrentUserId())
  .child(childval)
  .remove()
}


function loadFriends() {
  var uid = getCurrentUserId();
  var friendList = firebase
    .database()
    .ref("/friendList/")
    .child(uid);
  friendList.once("value", function(snapshot, context) {
    friendsDir.innerHTML = "<h2>Friends</h2>";
    snapshot.forEach(function(childSnapshot) {
      //if (childSnapshot.key == uid) {
      console.log("friend request: ", childSnapshot.key);
      //var node = document.createElement("LI");                 // Create a <li> node

      //node.appendChild(friendRequestPlaceHolder);
      //friendsDir.appendChild(node);
      var isFriend = childSnapshot.val()["friendStatus"];
      var friendRequestPlaceHolder = "";

      var username = "&quot;" + childSnapshot.val()["username"] + "&quot;";
      if (isFriend) {
        friendRequestPlaceHolder =
          '<div class="fb" id=' +
          childSnapshot.key +
          ">" +
          "<img src=" +
          profilePics[childSnapshot.key] +
          ' height="50" width="50" alt="Image of woman">' +
          '<p id="info"><b>' +
          username +
          "</b> <br></p>" +
          '<div id="button-block" class="friendRequests">' +
          '<div class = "deleteRequest" onclick="rejectFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Delete</div>" +
          "</div>" +
          "</div>";
      } else {
        friendRequestPlaceHolder =
          '<div class="fb" id=' +
          childSnapshot.key +
          ">" +
          "<img src=" +
          profilePics[childSnapshot.key] +
          ' height="50" width="50" alt="Image of woman">' +
          '<p id="info"><b>' +
          username +
          "</b> <br></p>" +
          '<div id="button-block" class="friendRequests">' +
          '<div class = "confirmRequest" onclick="acceptFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Confirm</div>" +
          '<div class = "deleteRequest" onclick="rejectFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Delete</div>" +
          "</div>" +
          "</div>";
      }

      friendsDir.innerHTML += friendRequestPlaceHolder;
    });
  });
}

function friendListTrigger() {
  var friendList = firebase
    .database()
    .ref("/friendList/")
    .child(getCurrentUserId());
  friendList.on("value", function(snapshot, context) {
    console.log("jibascao");
    friendsDir.innerHTML = "<h2>Friends</h2>";
    snapshot.forEach(function(childSnapshot) {
      //if (childSnapshot.key == uid) {
      console.log("friend request: ", childSnapshot.key);
      //var node = document.createElement("LI");                 // Create a <li> node

      //node.appendChild(friendRequestPlaceHolder);
      //friendsDir.appendChild(node);
      var isFriend = childSnapshot.val()["friendStatus"];
      var friendRequestPlaceHolder = "";
      var username = "&quot;" + childSnapshot.val()["username"] + "&quot;";

      if (isFriend) {
        friendRequestPlaceHolder =
          '<div class="fb" id=' +
          childSnapshot.key +
          ">" +
          "<img src=" +
          profilePics[childSnapshot.key] +
          ' height="50" width="50" alt="Image of woman">' +
          '<p id="info"><b>' +
          username +
          "</b> <br></p>" +
          '<div id="button-block" class="friendRequests">' +
          '<div class = "deleteRequest" onclick="rejectFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Delete</div>" +
          "</div>" +
          "</div>";
          friendsDir.innerHTML += friendRequestPlaceHolder;
          $(document).on('click','#'+childSnapshot.key+' img',function(){
            console.log(this.id)
            swithFriendChat(event, 'chatDir',childSnapshot.key)
            
          });
      } else {
        friendRequestPlaceHolder =
          '<div class="fb" id=' +
          childSnapshot.key +
          ">" +
          "<img src=" +
          profilePics[childSnapshot.key] +
          ' height="50" width="50" alt="Image of woman">' +
          '<p id="info"><b>' +
          username +
          "</b> <br></p>" +
          '<div id="button-block" class="friendRequests">' +
          '<div class = "confirmRequest" onclick="acceptFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Confirm</div>" +
          '<div class = "deleteRequest" onclick="rejectFriend(this.id, ' +
          username +
          ')" id=' +
          childSnapshot.key +
          ">Delete</div>" +
          "</div>" +
          "</div>";
          friendsDir.innerHTML += friendRequestPlaceHolder;
      }

      
    });
  });
}

function acceptFriend(friendId, username) {
  var currentDate = new Date();
  var mili = currentDate.getMilliseconds();
  var seconds = currentDate.getSeconds();
  var minutes = currentDate.getMinutes();
  var hours = currentDate.getHours();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();

  var dateString =
    mili +
    "-" +
    seconds +
    "-" +
    minutes +
    "-" +
    hours +
    "-" +
    date +
    "-" +
    (month + 1) +
    "-" +
    year;
  
  console.log("accpeted: ", friendId);
  updates = {};
  var uid = getCurrentUserId();
  var user = firebase.auth().currentUser;
  var email = user.email;
  var name = email.substring(0, email.indexOf("@"));
  updates["/friendList/" + uid + "/" + friendId] = {

    friendStatus: 1,
    timestamp: dateString,
    username: username,
    profUrl: profilePics[uid]
  };
  firebase
    .database()
    .ref()
    .update(updates);
  updates["/friendList/" + friendId + "/" + uid] = {
    friendStatus: 1,
    timestamp: dateString,
    username: name,
    profUrl: profilePics[uid]
  };
  firebase
    .database()
    .ref()
    .update(updates);
}

function rejectFriend(friendId, username) {
  console.log("rejected", friendId);
  console.log("/friendList/" + getCurrentUserId() + "/" + friendId);
  var friendList = firebase
    .database()
    .ref("/friendList/" + getCurrentUserId())
    .child(friendId)
    .remove();
  firebase
    .database()
    .ref("/friendList/" + friendId)
    .child(getCurrentUserId())
    .remove();
  //div.parentNode.removeChild(div);
  //console.log(div.innerHTML);
}

function friendStatus(friendId) {
  alert("friend Request Sent");
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

  var dateString =
    mili +
    "-" +
    seconds +
    "-" +
    minutes +
    "-" +
    hours +
    "-" +
    date +
    "-" +
    (month + 1) +
    "-" +
    year;

  /*
   * -1: Not currently a friend
   * 0: Friend request is sent
   * 1: Friend request is accepted
   */

  updates = {};
  update = {};
  update[uid] = 0;
  var user = firebase.auth().currentUser;
  var email = user.email;
  var name = email.substring(0, email.indexOf("@"));
  updates["/friendList/" + friendId + "/" + uid] = {
    friendStatus: 0,
    timestamp: dateString,
    username: name,
    profUrl: profilePics[uid]
  };
  firebase
    .database()
    .ref()
    .update(updates);
}

function favoriteDiningCourt(diningCourtId) {
  console.log("dining id: ", diningCourtId);
  $("#" + diningCourtId).html("Favorited");
  $("#" + diningCourtId).attr("disabled", "disabled");
  updates = {};
  updates[
    "/favoriteDiningCourts/" + getCurrentUserId() + "/" + diningCourtId
  ] = 1;
  firebase
    .database()
    .ref()
    .update(updates);
}

function addFavFood() {
  var food = document.getElementById("favFoodText");
  console.log(getCurrentUserId());
  var pushRef = firebase
    .database()
    .ref("/favoriteFoodList/" + getCurrentUserId());
  var pRef = pushRef.push();
  updates = {};
  updates["/favoriteFoodList/" + getCurrentUserId()] = food.value;
  pRef.set({
    food: food.value
  });
}

function loadDiningCourts() {
  timeArr = {};
  timeArr[0] = {};
  timeArr[1] = {};
  timeArr[2] = {};
  timeArr[3] = {};
  var indexTimeout = 1;
  /*updatesFlag = {};
  updatesFlag['/favoriteDiningCourts/' + getCurrentUserId() + '/flag'] = 1;
  firebase.database().ref('/favoriteDiningCourts/'+getCurrentUserId()).update(updatesFlag);*/
  firebase
    .database()
    .ref("/favoriteDiningCourts/" + getCurrentUserId())
    .once("value", function(snapshot_) {
      firebase
        .database()
        .ref("/timeSheets")
        .once("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            //for (let j = 0; j < 5; j++) {
            childSnapshot.forEach(function(childSnapshot_) {
              //console.log("suib: ",childSnapshot_.val());
              for (let index = 0; index < 4; index++) {
                timeArr = {};
                timeArr[0] = {};
                timeArr[1] = {};
                timeArr[2] = {};
                timeArr[3] = {};
              }

              //for (let i = 0; i < 4; i++) {
              var temp = childSnapshot_.val();
              var temp_index = 0;
              temp.forEach(function(temp_) {
                var tempStatus = temp_["status"];
                timeArr[temp_index]["status"] = tempStatus;
                if (tempStatus != "Open") {
                  //console.log("closed")
                  timeArr[temp_index]["start"] = "N/A";
                  timeArr[temp_index]["end"] = "N/A";
                  timeArr[temp_index]["status"] = "closed";
                } else {
                  timeArr[temp_index] = {};
                  timeArr[temp_index]["status"] = "Open";
                  //console.log('before: ',timeArr[temp_index]['start']);
                  //console.log("should be: ",temp_['time']['StartTime']);
                  timeArr[temp_index]["start"] = temp_["time"]["StartTime"];
                  //console.log('after: ', timeArr[temp_index]);
                  //console.log('index: ',temp_index);
                  timeArr[temp_index]["end"] = temp_["time"]["EndTime"];
                }
                temp_index++;
              });
              //}
              console.log("time sheets: ", timeArr);
              console.log("\n\n\n");

              var posArr = {
                Wiley: {
                  lat: 40.428476,
                  lng: -86.920799
                },
                Earhart: {
                  lat: 40.425691,
                  lng: -86.925023
                },
                Windsor: {
                  lat: 40.426757,
                  lng: -86.921091
                },
                Ford: {
                  lat: 40.432037,
                  lng: -86.919693
                },
                Hillenbrand: {
                  lat: 40.426663,
                  lng: -86.926691
                }
              };
              var favoriteList = snapshot_.val();
              console.log("favorite dining: ", favoriteList);
              var diningInfoId = childSnapshot_.key + "InfoWindow";
              var diningName = childSnapshot_.key;
              if (favoriteList == null || favoriteList[diningInfoId] == 0) {
                var contentString =
                  '<div id="content">' +
                  '<h3 id="firstHeading" class="firstHeading">' +
                  diningName +
                  "Dining Court</h3>" +
                  '<div id="bodyContent">' +
                  "<h3>Breakfast Start Time: " +
                  timeArr[0]["start"] +
                  "</h3>" +
                  "<h3>Breakfast End Time: " +
                  timeArr[0]["end"] +
                  "</h3>" +
                  "<h3>Lunch Start Time: " +
                  timeArr[1]["start"] +
                  "</h3>" +
                  "<h3>Lunch End Time: " +
                  timeArr[1]["end"] +
                  "</h3>" +
                  "<h3>Late Lunch Start Time: " +
                  timeArr[2]["start"] +
                  "</h3>" +
                  "<h3>Late Lunch End Time: " +
                  timeArr[2]["end"] +
                  "</h3>" +
                  "<h3>Dinner Start Time: " +
                  timeArr[3]["start"] +
                  "</h3>" +
                  "<h3>Dinner End Time: " +
                  timeArr[3]["end"] +
                  "</h3>" +
                  "<p><b>Favorite Food List: </b></p>" +
                  '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="favoriteDiningCourt(this.id)" id=' +
                  diningInfoId +
                  "> Favorite me</button>";
                "</div>" + "</div>";
              } else if (favoriteList[diningInfoId] == 1) {
                contentString =
                  '<div id="content">' +
                  '<h3 id="firstHeading" class="firstHeading">' +
                  diningName +
                  "Dining Court</h3>" +
                  '<div id="bodyContent">' +
                  "<h3>Breakfast Start Time: " +
                  timeArr[0]["start"] +
                  "</h3>" +
                  "<h3>Breakfast End Time: " +
                  timeArr[0]["end"] +
                  "</h3>" +
                  "<h3>Lunch Start Time: " +
                  timeArr[1]["start"] +
                  "</h3>" +
                  "<h3>Lunch End Time: " +
                  timeArr[1]["end"] +
                  "</h3>" +
                  "<h3>Late Lunch Start Time: " +
                  timeArr[2]["start"] +
                  "</h3>" +
                  "<h3>Late Lunch End Time: " +
                  timeArr[2]["end"] +
                  "</h3>" +
                  "<h3>Dinner Start Time: " +
                  timeArr[3]["start"] +
                  "</h3>" +
                  "<h3>Dinner End Time: " +
                  timeArr[3]["end"] +
                  "</h3>" +
                  "<p><b>Favorite Food List: </b></p>" +
                  '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="favoriteDiningCourt(this.id)" id=' +
                  diningInfoId +
                  " disabled> Favorited</button>";
                "</div>" + "</div>";
              } else {
                var contentString =
                  '<div id="content">' +
                  '<h3 id="firstHeading" class="firstHeading">' +
                  diningName +
                  "Dining Court</h3>" +
                  '<div id="bodyContent">' +
                  "<h3>Breakfast Start Time: " +
                  timeArr[0]["start"] +
                  "</h3>" +
                  "<h3>Breakfast End Time: " +
                  timeArr[0]["end"] +
                  "</h3>" +
                  "<h3>Lunch Start Time: " +
                  timeArr[1]["start"] +
                  "</h3>" +
                  "<h3>Lunch End Time: " +
                  timeArr[1]["end"] +
                  "</h3>" +
                  "<h3>Late Lunch Start Time: " +
                  timeArr[2]["start"] +
                  "</h3>" +
                  "<h3>Late Lunch End Time: " +
                  timeArr[2]["end"] +
                  "</h3>" +
                  "<h3>Dinner Start Time: " +
                  timeArr[3]["start"] +
                  "</h3>" +
                  "<h3>Dinner End Time: " +
                  timeArr[3]["end"] +
                  "</h3>" +
                  "<p><b>Favorite Food List: </b></p>" +
                  '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onclick="favoriteDiningCourt(this.id)" id=' +
                  diningInfoId +
                  "> Favorite me</button>";
                "</div>" + "</div>";
              }
              var infowindow = new google.maps.InfoWindow({
                content: contentString
              });

              console.log("loca: ", diningName);
              setTimeout(function() {
                var marker = new google.maps.Marker({
                  position: posArr[diningName],
                  animation: google.maps.Animation.DROP,
                  icon: {
                    url: "../dining.png",
                    scaledSize: new google.maps.Size(70, 70)
                  }
                });

                google.maps.event.addListener(marker, "click", function() {
                  infowindow.open(map, marker);
                  map.setZoom(18);
                  map.setCenter(marker.getPosition());
                });

                marker.setMap(map);
              }, indexTimeout * 200);
              /*var marker = new google.maps.Marker({
            position: posArr[diningName],
            animation: google.maps.Animation.DROP,
            icon: {
              url: '../dining.png',
              scaledSize: new google.maps.Size(70, 70)
            }
  
          });
  
          google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
            map.setZoom(18);
            map.setCenter(marker.getPosition());
            console.log("info value: ", favoriteList['WileyInfoWindow']);
  
          });
  
          marker.setMap(map);
  */
              console.log("hua ni ma");
              indexTimeout++;
            });
          });
        });
    });
  //console.log('fav: ',favoriteList);
}

function loadRecommendations() {}

function support() {
  let supportForm = document.querySelectorAll("#support-form");
  var user = firebase.auth().currentUser;
  var email = user.email;
  var name = email.substring(0, email.indexOf('@'));
  document.getElementById("email_support").value=email;
  document.getElementById("name_support").value=name;
  document.getElementById("support_support").value;
  supportForm[0].addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email_support").value;
    const name = document.getElementById("name_support").value;
    const support = document.getElementById("support_support").value;
    firebase.database().ref('/feedback/' + getCurrentUserId() + '/').update({
      email: email,
      name: name,
      feedback: support
    });
    openMI(event, 'Map');
  })
}

function onChangePassword() {
  let changePasswordForm = document.querySelectorAll("#changePassword-form");
  var user = firebase.auth().currentUser;
  changePasswordForm[0].addEventListener("submit", e => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const password1 = document.getElementById("password1").value;

    if (password == password1) {
      user
        .updatePassword(password)
        .then(function() {
          // Update successful.
          alert("Password changed successfully");
        })
        .catch(function(error) {
          alert("Password is not changed successfully");
          // An error happened.
        });
    } else {
      alert("Please check your repeated password");
    }
  });
}

function undisplayChat(){
  $('.tablinksFriendChat').ready(function(){
    console.log(this.id)
    swithFriendChat(event, 'friendsDir')
  });;
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    checkPrivacySettings();
    loadFriends();
    loadBlockList();
    loadDiningCourts();
    friendListTrigger();
    onChangePassword();
    support();
    onDeleteAccount();
    loadFavoriteFoodList();
    getBMI();
    undisplayChat();
    loadMessages();
    //loadLocations();
    //loadProfilePics();
    console.log("uid: ", firebase.auth().currentUser.uid);
    if (navigator.geolocation) {
      console.log("jin");
      navigator.geolocation.getCurrentPosition(
        function(position) {
          getLocationAndUpload();
          console.log("initial location");
          const firestore = firebase.firestore();
          /*const settings = {
          timestampsInSnapshots: true
        };
        firestore.settings(settings);*/
          var currentDate = new Date();

          var mili = currentDate.getMilliseconds();
          var seconds = currentDate.getSeconds();
          var minutes = currentDate.getMinutes();
          var hours = currentDate.getHours();
          var date = currentDate.getDate();
          var month = currentDate.getMonth(); //Be careful! January is 0 not 1
          var year = currentDate.getFullYear();

          var dateString =
            year +
            "-" +
            (month + 1) +
            "-" +
            date +
            "-" +
            hours +
            ":" +
            minutes +
            ":" +
            seconds +
            ":" +
            mili;
          firebase
            .firestore()
            .collection("usersProfilePics")
            .doc("flag")
            .set({
              uid: 1,
              timestamp: dateString
            });
        },
        function(error) {
          console.log("not support error");
        },
        { timeout: 10000 }
      );
    } else {
      // Browser doesn't support Geolocation
      console.log("not support");
      handleLocationError(false, infoWindow, map.getCenter());
    }
  } else {
    var user = firebase.auth().currentUser;
    if (user == null) {
      executed = false;
      console.log("location: ", window.location);
      //if(window.location.pathname == '/map.html'){
      //window.location = './index.html'
      // }

      console.log("logout");
      window.location = "./index.html";
    }
  }
});

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  console.log("enter media file");
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match("image.*")) {
    var data = {
      message: "You can only share images",
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  saveImageMessage(file);
}

function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
    console.log("value in toggle: ", messageInputElement.value);
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

//setInterval(getLocationAndUpload, 5000);
//checkLogIn();
loadLocations();
loadProfilePics();

//loadFriends();
//saveMessagingDeviceToken();

/**
 * DOM elements
 */
var imageButtonElement = document.getElementById("submitImage");
var imageFormElement = document.getElementById("image-form");
var mediaCaptureElement = document.getElementById("mediaCapture");
var friendsDir = document.getElementById("friendsDir");
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submitMessage');




messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);
//submitButtonElement.addEventListener('click', toggleButton);

var settings = document.getElementById("settingButton");
if (window.location.pathname == "/map.html") {
  let signOutButtonElement = document.getElementById("signout");
  signOutButtonElement.addEventListener("click", signOut);
}

// Events for image upload.
imageButtonElement.addEventListener("click", function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener("change", onMediaFileSelected);

function getBMI(){
  const db = firebase.database();
  var docRef = firebase.firestore().collection("userSettings").doc(getCurrentUserId());
  docRef.get().then(function(doc) {
    if (doc.exists) {
        document.getElementById("current-bmi").innerHTML = doc.data().bmi.toFixed(1).toString();
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});
}

function updatePrivacySettings() {
  const db = firebase.database();
  var docRef = firebase.firestore().collection("privacySettings").doc(getCurrentUserId());
  var check0 = document.getElementById('privacy0').checked;
  var check1 = document.getElementById('privacy1').checked;
  var check2 = document.getElementById('privacy2').checked;
  var check3 = document.getElementById('privacy3').checked;
  docRef.update({
    privacy0: check0,
    privacy1: check1,
    privacy2: check2,
    privacy3: check3
  });
}

function checkPrivacySettings(){
  const db = firebase.database();
  var docRef = firebase.firestore().collection("privacySettings").doc(getCurrentUserId());

  docRef.get().then(function(doc) {
    if (doc.exists) {
      if(doc.data().privacy0 == true){
        document.getElementById('privacy0').checked = true;
      }
      if(doc.data().privacy1 == true){
        document.getElementById('privacy1').checked = true;
      }
      if(doc.data().privacy2 == true){
        document.getElementById('privacy2').checked = true;
      }
      if(doc.data().privacy3 == true){
        document.getElementById('privacy3').checked = true;
      }
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
}