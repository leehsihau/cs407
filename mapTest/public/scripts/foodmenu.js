/*function getMealTime(diningCourt){
    var time = new Date();
    time = time.getHours();
    var openTime; //Find breakfast open time
    var closeTime; //Find breakfast close time
    for(let i = 0; i < 4; i++){
        if(time > openTime && time < closeTime){
        return currMeal //TODO
        }
        openTime = //Set to open time of next meal
        closeTime = //Set to close time of next meal
    }
    return "Breakfast"
}
*/
var allCalories = [];
var allCounter = 0;
var meanCalories = 0;

function getMeanCalories(){
    let sum = 0;
    for(let i = 0; i < allCalories.length; i++){
        sum = sum + allCalories[i];
    }
    meanCalories = sum/allCalories.length;
}

function loadMenu(){
    var menus = ["menu Earhart", "menu Ford", "menu Hillenbrand", "menu Wiley", "menu Windsor"];
    var mealtime;
    for(let j = 0; j < 5; j++){
    for(let i = 0; i < 10; i++){
        var node = document.createElement("div"); //Wrapper
        node.setAttribute('class', 'menu-item-wrapper');  
        var node3 = document.createElement("div");
        node3.setAttribute('class', 'menu-item'); //Item name
        var textnode = document.createTextNode("item " + i);
        node3.appendChild(textnode);
        var node2 = document.createElement("div");
        node2.setAttribute('class', 'calories'); //Calories
        var calories; //Fetch calories from JSON
        var textnode2 = document.createTextNode("Calories: ");
        node2.appendChild(textnode2);
        node.appendChild(node3);
        node.appendChild(node2);
        document.getElementById(menus[j]).appendChild(node);
        allCalories.push(calories);
        allCounter++;
    }
}
    getMeanCalories();
}

function filterMenu(highLow){
    if(lowHigh == 0){ //Nothing is selected
        var node = document.getElementsByClassName('menu-item-wrapper');
        node.style.display = "block";
    }
    else if(lowHigh == 1){//If low is selected
        var node = 
    }
    else{//High is selected

    }
}