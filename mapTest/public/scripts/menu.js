$(function(){
    $(".mdl-menu__item").click(function(){
        var id = $(this).attr("id");
        alert(id+" was clicked")
    });
})

function openMI(evt, menu_item){
    alert(menu_item);
}