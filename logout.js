let logout = document.querySelectorAll("#logout");
logout = addEventListener('click', e => {
    e.preventDefault();
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    });