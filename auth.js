var firebaseConfig = {
  apiKey: "AIzaSyB5ktXembdAM9WmU8rFXsSiXdOBFTBQc-U",
  authDomain: "lunchmate-9b46b.firebaseapp.com",
  databaseURL: "https://lunchmate-9b46b.firebaseio.com",
  projectId: "lunchmate-9b46b",
  storageBucket: "lunchmate-9b46b.appspot.com",
  messagingSenderId: "13075930277",
  appId: "1:13075930277:web:a7c6eeaf25ead0124c414c",
  measurementId: "G-6BW0283KH3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let signupForm = document.querySelectorAll("#signup-form");
signupForm = addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  auth.createUserWithEmailAndPassword(email, password).catch(function(err) {
    alert(err.message);
    // close the signup modal & reset form

    auth.signInWithEmailAndPassword(email, password).catch(function(err) {
      alert(err.message);
    });
  });
});

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(user);
  } else {
    console.log("not log in");
  }
});
