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

let playerHouse;
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

const button = select('#joinGame');
button.addEventListener('click', (e) => {
    document.querySelector(`#title`).remove();
    document.querySelector(`#joinGame`).remove();
    let user = firebase.auth().currentUser;
    let playerId = user.uid;
    let username = user.displayName;
    const playerRef = getRef(`gtc/players/${playerId}`);
    playerRef.set({
        id: playerId,
        name: username,
    })
    playerRef.onDisconnect().remove();
    body.appendChild(waitingRoom)
    let inGame = false;
    readVal(`gtc/houses`).then(snapshot => {
        if(snapshot){
            let i = 1;
            while (inGame == false && i<Object.keys(snapshot).length+1){
                if(Object.keys(snapshot[i]['members']).includes(getId())){
                    getRef(`gtc/players/${getId()}`).update({house: i})
                    playerHouse = i;
                    getRef(`gtc/turn`).on(`value`, snapshot => {
                        playTurn()
                    })                    
                    inGame = true;
                }
                i += 1;
            }
        }
        else{
            getRef(`gtc/turn`).on(`value`, snapshot => {
                if(snapshot.val())playTurn();
            })                        
            getRef('gtc/start').off()
        }
    })
})

function showGame(){
    const waitingRoom = select(`#waitingRoom`)
    if(waitingRoom)waitingRoom.remove();

    if(!select(`#housemates`))body.appendChild(makeHousemates())
    body.insertBefore(makeForest(),body.childNodes[2])
    if(!select(`#options`))body.appendChild(makeOptions())
}
function makeHousemates(){
    const houseMates = make(`div`,`id`,`housemates`,`Housemates:`)
    readVal(`gtc/houses/${playerHouse}/members`).then(snapshot => {
        const members = Object.keys(snapshot);
        const selfId = getId();
        for (let i=0;i<members.length;i++){
            if(members[i]!=selfId){
                const houseMate = make(`div`,`class`,`houseMate`,`${snapshot[members[i]].name}`)
                houseMates.appendChild(houseMate)
            }
        }
    })
    return houseMates;
}
function makeForest(){
    if(select(`#forest`)){select(`#forest`).remove()};
    let forest = make(`div`,`id`,`forest`);
    readVal(`gtc/forest`).then(snapshot => {
        forest.innerHTML = `Forest: ${snapshot} trees`;
    })
    return forest;
}
function makeOptions(){
    //make options to choose
    let options = make(`div`,`id`,`options`)
    readVal(`gtc/houses/${playerHouse}/members/${getId()}/gatherWood`).then(val => {
        const gatherContainer = make(`div`,`id`,`gatherContainer`)

        const gather = make(`button`,`id`,`gather`,`Gather ${val} wood from forest: `)
        const gatherup = make('button',`id`,`gatherup`);
        gatherup.innerHTML = (`<i class="arrow up"></i>`)
        const gatherdown = make('button',`id`,`gatherdown`);
        gatherdown.innerHTML = (`<i class="arrow down"></i>`)

        gatherContainer.appendChild(gatherdown)
        gatherContainer.appendChild(gather)
        gatherContainer.appendChild(gatherup)
        readVal(`gtc/maxWood`).then(max => {
            if(val>max){gather.classList.add(`violation`)
            gather.innerHTML += `Violation! You could be punished for gathering too much wood.`
            }
            gatherup.addEventListener(`click`, (e) => increment('up'))
            gatherdown.addEventListener(`click`, (e) => increment('down'))
        })
        options.insertBefore(gatherContainer, options.childNodes[0])
        gather.addEventListener('click', (e) => {detectChange(`gather`, gather)})
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

    readVal(`gtc/houses/${playerHouse}/members/${getId()}/move`).then(move => {
            if(move)document.getElementById(`${move}`).classList.add(`selected`)
        }
    )

    return options;
}

function increment(dir){
    let max;
    readVal(`gtc/maxWood`).then(maxWood => max = maxWood)
    readVal(`gtc/houses/${playerHouse}/members/${getId()}`)
        .then((player) => {
          let gatherWood = player.gatherWood;
          const newWood = dir == "up" ? gatherWood < 10? gatherWood + 1 : 10 : gatherWood > 0 ? gatherWood - 1 : 0;
          if(document.querySelector(`.selected`)){
            if(newWood > gatherWood && document.querySelector(`.selected`).id == `gather`){
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood+1});
                })
            }
            if(newWood < gatherWood && document.querySelector(`.selected`).id == `gather`){
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood-1});
                })
            }
        }
          getRef(`gtc/houses/${playerHouse}/members/${getId()}`).update({gatherWood: newWood});
          gatherButton = document.querySelector(`#gather`)
          let buttonMessage = `Gather ${newWood} wood from forest`;
          if(newWood > max){
            gatherButton.classList.add(`violation`)
            buttonMessage += `(Violation! You could be punished for gathering too much wood.)`
          }else{
            gatherButton.classList.remove(`violation`)
          }
          gatherButton.innerHTML = buttonMessage;    
        })
        .catch((error) => {
            console.log(error)
        });
}

function detectChange(move, element){
    readVal(`gtc/freeze`).then(async (freeze) => {
        if(freeze == `true`)return;

        const choices = document.querySelectorAll(`.selected`);
        let choice = {id: `none`};
        if(choices[0]){
            choice = choices[0];
            choice.classList.remove('selected');
        }
        //increments/decrements database guard count
        if (choice.id == `guard` && element.id != `guard`){
            readVal(`gtc/guards`).then(numGuards => {
                getRef(`gtc`).update({guards: numGuards-1});
            })
        }else if(choice.id != `guard` && element.id == `guard`){
            readVal(`gtc/guards`).then(numGuards => {
                getRef(`gtc`).update({guards: numGuards+1});
            })
        }
        // await delay(100);
        //adds gathering wood to house's currentWood
        if (choice.id == `gather` && element.id != `gather`){
            readVal(`gtc/houses/${playerHouse}/members/${getId()}/gatherWood`).then(gatherWood => {
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood-gatherWood});
                })
            })
        }else if(choice.id != `gather` && element.id == `gather`){
            readVal(`gtc/houses/${playerHouse}/members/${getId()}/gatherWood`).then(gatherWood => {
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood+gatherWood});
                })
            })
        }
        //adds planting wood to house's currentWood
        if (choice.id == `plant` && element.id != `plant`){
            readVal(`gtc/plantWood`).then(async plantWood => {
                await delay(100);
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood-plantWood});
                })
            })
        }else if(choice.id != `plant` && element.id == `plant`){
            readVal(`gtc/plantWood`).then(async plantWood => {
                await delay(100);
                readVal(`gtc/houses/${playerHouse}/currentWood`).then(currentWood => {
                    getRef(`gtc/houses/${playerHouse}`).update({currentWood: currentWood+plantWood});
                })
            })
        }

        //adds red border, updates move in database
        element.classList.add(`selected`)
        getRef(`gtc/houses/${playerHouse}/members/${getId()}`).update({move: move})
        
    })
}

const stopListening = firebase.database().ref('gtc/players').on("child_added", (snapshot) => {
    let player = document.createElement(`div`);
    player.setAttribute("class","player")
    player.appendChild(document.createTextNode(`${snapshot.val().name}`));
    playerList.appendChild(player);
});


const delay = ms => new Promise(res => setTimeout(res, ms));
async function playTurn(){
    await delay(3000);
    //changes move in database to null, resets visual of selected move
    getRef(`gtc/houses/${playerHouse}/members/${getId()}`).update({move: null})
    
    const choices = document.querySelectorAll(`.selected`);
    for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        choice.classList.remove('selected');
    }


    readVal(`gtc/players/${getId()}/house`).then(house => {
        playerHouse = house;
        showGame();
    })
}


