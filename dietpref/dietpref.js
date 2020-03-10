/* This file handles all diet preference functionality */

/* Code for submitting diet preferences */

function dietSubmitHandler() {

    //Current weight in pounds
    var currentWeight = document.getElementById('weight-update');
    var currentHeightFt = document.getElementById('height-ft');
    var currentHeightIn = document.getElementById('height-in');
    var bmi;
    console.log(currentWeight.value);
    console.log(currentHeightFt.value);
    if (currentWeight.value != "") {
      if (currentHeightFt.value != "" && currentHeightIn.value != "") {
        bmi = 703 * (parseInt(currentWeight.value) / Math.pow((parseInt(currentHeightIn.value) + (parseInt(currentHeightFt.value) * 12)), 2));
        window.alert("Current BMI: " + bmi.toString());
      }
      else {
        window.alert("Not enough information to calculate BMI")
      }
    }
    else {
      window.alert("Not enough information to calculate BMI")
    }
  
    //Weight radio buttons
  
    var gainWeight = document.getElementById('gain');
    var loseWeight = document.getElementById('lose');
    var neitherWeight = document.getElementById('neither');
    var selectedWeightButton;
  
    if (gainWeight.checked == true) {
      selectedWeightButton = gainWeight;
    }
    else if (loseWeight.checked == true) {
      selectedWeightButton = loseWeight;
    }
    else {
      selectedWeightButton = neitherWeight;
    }
  
    console.log(selectedWeightButton);
  
    //TODO: Add privacy checkboxes
  
    firebase.firestore().collection('userSettings').doc(getCurrentUserId()).update({
      uid: getCurrentUserId(),
      weight: currentWeight.value,
      heightFt: currentHeightFt.value,
      heightIn: currentHeightIn.value,
      bmi: bmi,
      gainLose: selectedWeightButton.value
    }).catch(function (error) {
      console.log("error: " + error);
    });
  }
  
  /* Allergen list */
  
  function addAllergens() {
    let uid = getCurrentUserId();
    const db = firebase.database();
    var allergens = new Array();
  
    for (let i = 0; i < 11; i++) {
      var current = 'allergen' + i.toString();
      if (document.getElementById(current).checked) {
        allergens.push(document.getElementById(current).value);
      }
    }
  
    console.log(allergens);
  
    firebase.firestore().collection('userAllergensList').doc(getCurrentUserId()).update({
      uid: getCurrentUserId(),
      timestamp: dateString,
      allergens: allergens
    }).catch(function (error) {
      console.log("error: " + error);
    });
  }