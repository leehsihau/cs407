var firebaseConfig = {
  apiKey: "AIzaSyB5ktXembdAM9WmU8rFXsSiXdOBFTBQc-U",
  authDomain: "lunchmate-9b46b.firebaseapp.com",
  databaseURL: "https://lunchmate-9b46b.firebaseio.com",
  projectId: "lunchmate-9b46b",
  // storageBucket: "project-id.appspot.com",
  // messagingSenderId: "sender-id",
  appId: "1:13075930277:web:a7c6eeaf25ead0124c414c"
};
/* let map, infoWindow;
  let gmarkers = new Map();//array for google map markers */

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function deleteAccount() {
  var user = firebase.auth().currentUser;

  user
    .delete()
    .then(function() {
      // User deleted.
    })
    .catch(function(error) {
      console.log(error);
      // An error happened.
    });
  window.location("./createaccount.html");
}

function getCurrentUserId() {
  var user = firebase.auth().currentUser;
  //console.log("current uid in func: "+user.uid);
  return user.uid;
}

//sign up
let signupForm = document.querySelectorAll("#signup-form");
signupForm = addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  if (!password.match(/[a-zA-Z0-9]/)) {
    alert("contains special character");
    window.location("./createaccount.html");
  }
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(cred => {
      console.log(cred.user);
      window.location = "./map.html";
      // close the signup modal & reset form
    })
    .catch(function(err) {
      alert(err);
    });
});

//forget password
if (window.location.pathname == "/forgetpassword.html") {
  let forgetForm = document.querySelectorAll("#forget-form");
  forgetForm = document
    .getElementById("submit_forget")
    .addEventListener("click", e => {
      console.log("forget");
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
if (
  window.location.pathname == "/index.html" ||
  window.location.pathname == "/"
) {
  let signinForm = document.querySelectorAll("#signin-form");

  signinForm = document.getElementById("login").addEventListener("click", e => {
    console.log("dian");
    e.preventDefault();
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;
    auth.signInWithEmailAndPassword(email, password).then(cred1 => {
      console.log(cred1.user);
      window.location = "/map.html";
    });
  });
}

//sign in google
//google login
if (
  window.location.pathname == "/index.html" ||
  window.location.pathname == "/"
) {
  var signInButtonElement = document.getElementById("sign-in");
  signInButtonElement.addEventListener("click", signInGoogle);
  function signInGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("google");
        window.location = "/map.html";
        // ...
      })
      .catch(function(error) {
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
}
