

function loadMenu(){
    //Figure out how to grab data here
    
    
    
    for(let i = 0; i < 10; i++){
        var node = document.createElement("div");
        node.setAttribute('class', 'menu-item');
        var textnode = document.createTextNode("item " + i);
        node.appendChild(textnode);
        document.getElementById("menu-page-wrapper").appendChild(node);

    }
}