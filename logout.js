let signinForm = document.querySelectorAll("#main-page");
signin = addEventListener("submit", e => {
    e.preventDefault();
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    });