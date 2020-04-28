

function loadMenu(){
    var menus = ["menu Earhart", "menu Ford", "menu Hillenbrand", "menu Wiley", "menu Windsor"];
    for(let j = 0; j < 5; j++){
    for(let i = 0; i < 10; i++){
        var node = document.createElement("div");
        node.setAttribute('class', 'menu-item');
        var textnode = document.createTextNode("item " + i);
        node.appendChild(textnode);
        var node2 = document.createElement("div");
        node2.setAttribute('class', 'calories');
        var textnode2 = document.createTextNode(//TODO)
        node2.appendChild(textnode2);
        document.getElementById(menus[j]).appendChild(node);
        document.getElementsByTagName(menus[j]).appendChild(node2);
    }
}
}