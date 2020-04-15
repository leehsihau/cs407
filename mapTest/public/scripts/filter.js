function filterNoProfileUsers() {
    var query = firebase.firestore().collection("usersProfilePics");

    //Start listening to the query.
    query.onSnapshot(function(snapshot) {
        console.log("called");
        snapshot.docChanges().forEach(function(change) {
            var message = change.doc.data();
            //console.log("someone just uploaded their profilePic");
            //console.log("imageUrl", message.imageUrl);
            if (message.imageUrl == undefined) {
              console.log("no profile pic");
            }
        });
    });
}