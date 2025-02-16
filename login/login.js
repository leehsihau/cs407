let signinForm = document.querySelectorAll("#signin-form");
signinForm = addEventListener("image", e => {
  e.preventDefault();
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
});
/*
auth().onAuthStateChanged(user => {
    if(user) {
        window.location = 'createAccount.html';
        console.log(firebase.auth().currentUser.uid)
    }
});*/