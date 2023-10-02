//once authorization state changes, add player to firebase
let initialCheck = false;
firebase.auth().onAuthStateChanged((user) => {
  if (initialCheck == false) {
    initialCheck = true;
    if (user) {
      let playerId = user.uid;
      let username = user.displayName;
      showGames();

      let playerRef = firebase.database().ref(`players/${playerId}`);
      playerRef.set({
        id: playerId,
        name: username,
      });

      playerRef.onDisconnect().remove();
    } else {
      showSignIn();
    }
  }
});

function update(username) {
  user = firebase.auth().currentUser;
  user
    .updateProfile({
      displayName: username,
      name: username,
    })
    .then(() => {
      user.getIdToken(true);
      firebase.database().ref(`players/${user.uid}`).update({ name: username });
      showGames();
    })
    .catch((error) => {
      console.log(error);
    });
}

function addBackButtonFunctionality() {
  document.querySelector("#backButton").addEventListener("click", (e) => {
    showSignIn();
  });
}
