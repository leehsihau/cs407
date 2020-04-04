/*
*Uncomment this function if you need to check which menu item was clicked by the user
$(function(){
    $(".mdl-menu__item").click(function(){
        var id = $(this).attr("id");
        alert(id+" was clicked")
    });
})
*/

/*Implement functionality for tabbing with menu items*/
function openMI(evt, menu_item){
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