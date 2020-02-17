let changePasswordForm = document.querySelectorAll("#changePassword-form");
var user = firebase.auth().currentUser;
changePasswordForm = addEventListener("submit", e => {
  e.preventDefault();
  const password= document.getElementById("password").value;
  const password1= document.getElementById("password1").value;

  if(password==password1) {
    user.updatePassword(password).then(function() {
        // Update successful.
        alert("Password changed successfully")
      }).catch(function(error) {
        alert("Password is not changed successfully")
        // An error happened.
      });
  }
  else {
      alert("Please check your repeated password");
  }
});
