let welcome = document.createElement(`div`);
welcome.setAttribute("id","title")
welcome.appendChild(document.createTextNode(`Welcome to Governing the Commons!`))

let playerList = document.createElement(`div`);
let title = document.createElement(`div`);
title.setAttribute("class","title")
title.appendChild(document.createTextNode(`Players`));
playerList.setAttribute("id","playerList")
playerList.appendChild(title);

let body = document.querySelector(`body`);
body.append(welcome);
body.append(playerList)

const stopListening = firebase.database().ref('gtc/players').on("child_added", (snapshot) => {
    let player = document.createElement(`div`);
    player.setAttribute("class","player")
    player.appendChild(document.createTextNode(`${snapshot.val().name}`));
    playerList.appendChild(player);
});


const initGame = firebase.functions().httpsCallable('initGTC');
let startGame = document.createElement('button');
startGame.setAttribute("id","joinGame")
startGame.appendChild(document.createTextNode(`Start Game!`));
body.appendChild(startGame);
const button = document.querySelector('#joinGame');
button.addEventListener('click', (e) => {
    document.querySelector(`#title`).remove();
    document.querySelector(`#playerList`).remove();
    button.remove();
    initGame();
})

// const create = firebase.functions().httpsCallable('addPlayers');
// create()
