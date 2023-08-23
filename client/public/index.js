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

function showGames() {
  let signIn = document.querySelector("#signIn");
  let parent = document.querySelector(".optionsList");

  const gameList = document.createElement(`div`);
  gameList.setAttribute(`id`, `games`);
  gameList.innerHTML = `
    <button onclick="window.location.href='gtc.html'">Governing The Commons</button>
    <button>Postwar Politics</button>
    <button>Korean Factions</button>
    <button>Warlord China</button>
    <button>Japanese Foreign Policy</button>
    <button>Insurgencies</button>
    <button id="backButton">Back</button>
    `;
  if (signIn) {
    signIn.remove();
  }
  parent.appendChild(gameList);
  addBackButtonFunctionality();
}
