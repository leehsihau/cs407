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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const storageService = firebase.storage();
const storageRef = storageService.ref();

document.querySelector('.file-select').addEventListener('change', handleFileUploadChange);
document.querySelector('.file-submit').addEventListener('click', handleFileUploadSubmit);

let selectedFile;
function handleFileUploadChange(e) {
  selectedFile = e.target.files[0];
}

function handleFileUploadSubmit(e) {
    const uploadTask = storageRef.child(`images/${selectedFile.name}`).put(selectedFile); //create a child directory called images, and place the file inside this directory
    uploadTask.on('state_changed', (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    }, (error) => {
      // Handle unsuccessful uploads
      console.log(error);
    }, () => {
       // Do something once upload is complete
       console.log('success');
    });
}