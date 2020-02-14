function createAccount() {

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    
    if (email.val || password.val) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) 
        {
            var errorCode = error.code;
            var errorMessage = errorMessage;
        });
    }
}