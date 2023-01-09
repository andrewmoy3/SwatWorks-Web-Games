function make(type, attribute, attrName,text){
    let element = document.createElement(type);
    if(attribute)element.setAttribute(attribute, attrName);
    if(text)element.appendChild(document.createTextNode(text));
    return element
}

function select(selector){
    return document.querySelector(selector)
}

function getId(){
    return firebase.auth().currentUser.uid
}

function getRef(string){
    return firebase.database().ref(string);
}

function readVal(string){
    return firebase.database().ref(string).once(`value`).then(snapshot => {
        return snapshot.val();
    })
}
const welcome = make(`div`,`id`,`title`,`Welcome to Governing the Commons!`);
const join = make(`button`,`id`,`joinGame`,`Join Game!`)
const title = make(`div`,`class`,`title`,`Waiting Room`)
const waitingRoom = make(`div`,`id`,`waitingRoom`);
const playerList = make(`div`,`id`,`playerList`);

waitingRoom.appendChild(title);
waitingRoom.appendChild(playerList)

let body = select(`body`);
body.append(welcome);
body.append(join);

let user = firebase.auth().currentUser;
let playerId = user.uid;
let username = user.displayName;
const playerRef = getRef(`gtc/players/${playerId}`);
playerRef.set({
    id: playerId,
    name: username,
})
playerRef.onDisconnect().remove();

const button = select('#joinGame');
button.addEventListener('click', (e) => {
    document.querySelector(`#title`).remove();
    document.querySelector(`#joinGame`).remove();
    body.appendChild(waitingRoom)
    let inGame = false;
    readVal(`gtc/houses`).then(snapshot => {
        let i = 1;
        while (inGame == false && i<Object.keys(snapshot).length+1){
            if(Object.keys(snapshot[i]['members']).includes(getId())){
                getRef(`gtc/players/${getId()}`).update({house: i})
                showGame()
                inGame = true;
            }
            i += 1;
        }
    })
    if(inGame == false){
        readVal('gtc/start').then((result) => {
            getRef('gtc/start').on("value", (snapshot) => {
                if(snapshot.val() != result){
                    showGame()
                    getRef('gtc/start').off()
                }
            })        
        });
    }
})

function showGame(){
    if(select('#options'))return;
    const playerList = select(`#playerList`)
    if(playerList)playerList.remove();

    //show housemates
    const houseMates = make(`div`,`id`,`housemates`,`Housemates:`)
    readVal(`gtc/players/${getId()}/house`).then(house => {
        readVal(`gtc/houses/${house}/members`).then(snapshot => {
            const members = Object.keys(snapshot);
            const selfId = getId();
            for (let i=0;i<members.length;i++){
                if(members[i]!=selfId){
                    const houseMate = make(`div`,`class`,`houseMate`,`${snapshot[members[i]].name}`)
                    houseMates.appendChild(houseMate)
                }
            }
        })
    })


    //make options to choose
    let options = make(`div`,`id`,`options`)
    let forest = make(`div`,`id`,`forest`)
    readVal(`gtc/forest`).then(snapshot => {
        forest.appendChild(document.createTextNode(`Forest: ${snapshot} trees`))
    })


    readVal(`gtc/maxWood`).then(val => {
        let gather = make(`button`,`id`,`plant`,`Gather ${val} wood from forest: `)
        options.insertBefore(gather, options.childNodes[0])
        gather.addEventListener('click', (e) => {detectChange(`gather`, gather)})
        getRef('gtc/maxWood').on("value", (snapshot) => {
            gather.innerHTML = `Gather ${snapshot.val()} wood from forest`
        })
    })

    let guard = make(`button`,`id`,`guard`,`Protect the forest: `)
    options.appendChild(guard)
    guard.addEventListener('click', (e) => {detectChange(`guard`, guard)})

    readVal(`gtc/plantWood`).then(val => {
        let plant = make(`button`,`id`,`plant`,`Plant ${val} wood: `)
        options.appendChild(plant)
        plant.addEventListener('click', (e) => {detectChange(`plant`, plant)})
        getRef('gtc/plantWood').on("value", (snapshot) => {
            plant.innerHTML = `Plant ${snapshot.val()} wood`
        })
    })

    body.appendChild(houseMates)
    body.appendChild(forest)
    body.appendChild(options)
}

function detectChange(move, element){
    const choices = document.querySelectorAll(`.selected`);
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        choice.classList.remove('selected');
        if (choice.id == `guard` && element.id != `guard`){
            console.log(`subtract`)
            readVal(`gtc/guards`).then(numGuards => {
                getRef(`gtc`).update({guards: numGuards-1});
            })
        }else if(choice.id != `guard` && element.id == `guard`){
            console.log(`add`)
            readVal(`gtc/guards`).then(numGuards => {
                getRef(`gtc`).update({guards: numGuards+1});
            })
        }
    }
    
    element.classList.add(`selected`)
    readVal(`gtc/players/${getId()}/house`).then(house => {
        getRef(`gtc/houses/${house}/members/${getId()}`).update({move: move})
    })
}

const stopListening = firebase.database().ref('gtc/players').on("child_added", (snapshot) => {
    let player = document.createElement(`div`);
    player.setAttribute("class","player")
    player.appendChild(document.createTextNode(`${snapshot.val().name}`));
    playerList.appendChild(player);
});


getRef(`gtc/turn`).on(`value`, snapshot => {
    playTurn()
})
function playTurn(){
    const choices = document.querySelectorAll(`.selected`);
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        choice.classList.remove('selected');
    }

}


