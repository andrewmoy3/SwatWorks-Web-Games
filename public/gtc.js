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
    const gameStart = firebase.database().ref('gtc/start').on("value", (snapshot) => {
        const playerList = document.querySelector(`#playerList`)
        if(playerList)playerList.remove();
        let options = document.createElement(`div`)
        options.setAttribute('id', 'options')
        let forest = document.createElement(`div`);
        forest.setAttribute("id","forest")
        forest.appendChild(document.createTextNode(`Forest: `))
        body.appendChild(forest)
        let gather = document.createElement(`button`);
        gather.setAttribute("id","gather")
        firebase.database().ref(`gtc/maxWood`).once(`value`).then(snapshot => {
            const maxWood = snapshot.val();
            gather.appendChild(document.createTextNode(`Gather ${maxWood} wood from forest: `))
        })
        options.appendChild(gather)
        let guard = document.createElement(`button`);
        guard.setAttribute("id","guard")
        guard.appendChild(document.createTextNode(`Protect the forest`))
        options.appendChild(guard)
        let plant = document.createElement(`button`);
        plant.setAttribute("id","plant")
        firebase.database().ref(`gtc/plantWood`).once(`value`).then(snapshot => {
            const plantWood = snapshot.val();
            plant.appendChild(document.createTextNode(`Plant ${plantWood} wood: `))
        })
        options.appendChild(plant)
        body.appendChild(options)
    })
})

const stopListening = firebase.database().ref('gtc/players').on("child_added", (snapshot) => {
    let player = document.createElement(`div`);
    player.setAttribute("class","player")
    player.appendChild(document.createTextNode(`${snapshot.val().name}`));
    playerList.appendChild(player);
});

// const list = document.querySelector(`#playerList`)
//     if(list)list.remove();
//     let forest = document.createElement(`div`);
//     forest.setAttribute("id","forest")
//     forest.appendChild(document.createTextNode(`Forest: `))
//     body.appendChild(forest)

function playTurn(){
    firebase.database().ref(`gtc`).once(`value`).then(snapshot => {
        console.log(snapshot.val())
    })
}


