let welcome = document.createElement(`div`);
welcome.setAttribute("id","title")
welcome.appendChild(document.createTextNode(`Welcome to Governing the Commons!`))

let join = document.createElement(`button`);
join.setAttribute("id","joinGame")
join.appendChild(document.createTextNode(`Join Game!`));

let body = document.querySelector(`body`);
body.append(welcome);
body.append(join);

let playerList = document.createElement(`div`);
let title = document.createElement(`div`);
title.setAttribute("class","title")
title.appendChild(document.createTextNode(`Waiting Room`));
playerList.setAttribute("id","playerList")
playerList.appendChild(title);

let user = firebase.auth().currentUser;
let playerId = user.uid;
let username = user.displayName;
const playerRef = firebase.database().ref(`gtc/players/${playerId}`);
playerRef.set({
    id: playerId,
    name: username,
})
playerRef.onDisconnect().remove();

const button = document.querySelector('#joinGame');
button.addEventListener('click', (e) => {
    document.querySelector(`#title`).remove();
    document.querySelector(`#joinGame`).remove();
    body.appendChild(playerList)
    const stopListening = firebase.database().ref('gtc/players').on("child_added", (snapshot) => {
        let player = document.createElement(`div`);
        player.setAttribute("class","player")
        player.appendChild(document.createTextNode(`${snapshot.val().name}`));
        playerList.appendChild(player);
    });
})

// stopListening(); 


