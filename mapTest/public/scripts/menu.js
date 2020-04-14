/*
*Uncomment this function if you need to check which menu item was clicked by the user
$(function(){
    $(".mdl-menu__item").click(function(){
        var id = $(this).attr("id");
        alert(id+" was clicked")
    });
})
*/


//DOM
var messageListElement = document.getElementById('messages');

//globals
var friendId = 0;
// Template for messages.
var MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

/*Implement functionality for tabbing with menu items*/
function openMI(evt, menu_item) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent2");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks2");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(menu_item).style.display = "block";
  evt.currentTarget.className += " active";
}





function displayMessage(key, name, text, picUrl, imageUrl) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    messageListElement.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUrl) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function () {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    image.src = imageUrl + '&' + new Date().getTime();
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () { div.classList.add('visible') }, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

function loadMessages() {
  // TODO 7: Load and listens for new messages.
  // Loads the last 12 messages and listens for new ones.
  var callback = function (snap) {
    console.log("calling back");
    var data = snap.val();
    displayMessage(snap.key, data.name, data.text, data.profilePicUrl, data.imageUrl);
  };
  var uid = getCurrentUserId();

  if (friendId != 0) {
    firebase.database().ref('/messages/' + uid + '/' + friendId).limitToLast(12).on('child_added', callback);
    firebase.database().ref('/messages/'+uid+'/' + friendId).limitToLast(12).on('child_changed', callback);
  }
}

function sendMessage() {
  /*$('#message-form').on('click', function(){
    console.log("send ni nai nai ge tuier");
  })*/
  var message = document.getElementById("message").value;
  if (message.length == 0) {
    console.log("kong");
  } else {
    console.log("send ni nai nai ge tuier: ", message);
    var ref = firebase.database().ref("/messages/" + getCurrentUserId() + "/" + friendId);
    ref.push({
      name: "buddy",
      text: message,
    }).catch(function (error) {
      console.error('Error writing new message to Realtime Database:', error);
    });
    var ref = firebase.database().ref("/messages/" + friendId + "/" + getCurrentUserId());
    ref.push({
      name: "buddy",
      text: message,
    }).catch(function (error) {
      console.error('Error writing new message to Realtime Database:', error);
    });
  }
}

function swithFriendChat(evt, item, id) {
  console.log("uid in switch frind: ", id)
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("social-tab");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinksFriendChat");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(item).style.display = "block";
  evt.currentTarget.className += " active";
  if(id!=0){
    friendId = id;
    loadMessages();
  }else{
    messageListElement.innerHTML=' ';
    friendId=0;
  }
}