function testfunction(privacy_setting){
  var currentDate = new Date();
  var mili = currentDate.getMilliseconds();
  var seconds = currentDate.getSeconds();    
  var minutes = currentDate.getMinutes();
  var hours = currentDate.getHours();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();
  
  var dateString = mili + "-" + seconds + "-" + minutes + "-" + hours + "-" + date + "-" + (month + 1) + "-" + year;
  
  firebase.firestore().collection('privacySettings').doc(getCurrentUserId()).set({
    uid: getCurrentUserId(),
    timestamp: dateString,
    privacy0: document.getElementById('privacy0').checked,
    privacy1: document.getElementById('privacy1').checked,
    privacy2: document.getElementById('privacy2').checked,
    privacy3: document.getElementById('privacy3').checked
  }).catch(function (error) {
    console.log("error: " + error);
  });
}

function dietSubmitHandler() {
  //Current weight in pounds
  var currentWeight = document.getElementById("weight-update");
  var currentHeightFt = document.getElementById("height-ft");
  var currentHeightIn = document.getElementById("height-in");
  var bmi;
  console.log(currentWeight.value);
  console.log(currentHeightFt.value);
  if (currentWeight.value != "") {
    if (currentHeightFt.value != "" && currentHeightIn.value != "") {
      bmi =
        703 *
        (parseInt(currentWeight.value) /
          Math.pow(
            parseInt(currentHeightIn.value) +
              parseInt(currentHeightFt.value) * 12,
            2
          ));
      window.alert("Current BMI: " + bmi.toFixed(1).toString());
    } else {
      window.alert("Not enough information to calculate BMI");
    }
  } else {
    window.alert("Not enough information to calculate BMI");
  }

  //Weight radio buttons

  var gainWeight = document.getElementById("gain");
  var loseWeight = document.getElementById("lose");
  var neitherWeight = document.getElementById("neither");
  var selectedWeightButton;

  if (gainWeight.checked == true) {
    selectedWeightButton = gainWeight;
  } else if (loseWeight.checked == true) {
    selectedWeightButton = loseWeight;
  } else {
    selectedWeightButton = neitherWeight;
  }

  console.log(selectedWeightButton);

  //TODO: Add privacy checkboxes

  firebase
    .firestore()
    .collection("userSettings")
    .doc(getCurrentUserId())
    .set({
      uid: getCurrentUserId(),
      weight: currentWeight.value,
      heightFt: currentHeightFt.value,
      heightIn: currentHeightIn.value,
      bmi: bmi,
      gainLose: selectedWeightButton.value,
    })
    .catch(function (error) {
      console.log("error: " + error);
    });
  getBMI();
}

/* Allergen list */

/* Allergen list */

function addAllergens() {
  let uid = getCurrentUserId();
  const db = firebase.database();
  /**
    String teststring = "hello";
    firebase.database().ref('/userAllergens/'+uid).push(teststring);
    */
  //const allergen = document.getElementById('allergen0');
  var allergens = new Array();

  for (let i = 0; i < 11; i++) {
    var current = "allergen" + i.toString();
    if (document.getElementById(current).checked) {
      allergens.push(document.getElementById(current).value);
    }
  }

  console.log(allergens);
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

  firebase
    .firestore()
    .collection("userAllergensList")
    .doc(getCurrentUserId())
    .set({
      uid: getCurrentUserId(),
      timestamp: dateString,
      allergens: allergens,
    })
    .catch(function (error) {
      console.log("error: " + error);
    });
}
