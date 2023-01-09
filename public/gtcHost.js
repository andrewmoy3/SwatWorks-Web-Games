function make(type, attribute, attrName,text){
    let element = document.createElement(type);
    if(attribute)element.setAttribute(attribute, attrName);
    if(text)element.appendChild(document.createTextNode(text));
    return element
}

function select(selector){
    return document.querySelector(selector)
}

function getRef(string){
    return firebase.database().ref(string);
}

function readVal(string){
    return firebase.database().ref(string).once(`value`).then(snapshot => {
        return snapshot.val();
    })
}

const create = firebase.functions().httpsCallable('addPlayers');
create()

const welcome = make(`div`,`id`,`title`,`Welcome to Governing the Commons!`);
const title = make(`div`,`class`,`title`,`Players`)
const waitingRoom = make(`div`,`id`,`waitingRoom`);
const playerList = make(`div`,`id`,`playerList`);

waitingRoom.appendChild(title);
waitingRoom.appendChild(playerList)

let body = select(`body`);
body.append(welcome);
body.append(waitingRoom);

const gameBody = make(`div`,`id`,`gameBody`);
const header = make(`div`,`id`,`header`,`Governing the Commons`);

const stopListening = getRef('gtc/players').on("child_added", (snapshot) => {
    let player = make(`div`,`class`,`player`,`${snapshot.val().name}`);
    playerList.appendChild(player);
});

const initGame = firebase.functions().httpsCallable('initGTC');
let startGame = make('button',`id`,`joinGame`,`Start Game!`);
body.appendChild(startGame);

const button = select('#joinGame');
button.addEventListener('click', (e) => {
    select(`#title`).remove();
    select(`#waitingRoom`).remove();
    button.remove();
    initialize()
})

async function initialize() {
    await initGame();
    body.appendChild(header);
    body.appendChild(gameBody);
    showVars();
    showHouses();
}
  
function showVars(){

    const constContainer = make('div',`id`,`constContainer`);
    const varContainer = make('div',`id`,`varContainer`);
    const subTitle = make('div',`class`,`subTitle`,`Variables`);
    const constants = make('div',`id`,`constants`);
    const constantTitle = make('div',`class`,`subTitle`,`Constants`);
    const variableDiv = make('div',`class`,`container`);
    const numGuards = make(`div`,`id`,`numGuards`,`Guards: 0`)

    getRef(`gtc/guards`).on(`value`, (snapshot) => {
        numGuards.innerHTML = `Guards: ${snapshot.val()}`
    })

    constants.appendChild(constantTitle);
    constants.appendChild(numGuards);
    varContainer.appendChild(subTitle);
    varContainer.appendChild(variableDiv);
    constContainer.appendChild(varContainer);
    constContainer.appendChild(constants);
    gameBody.appendChild(constContainer);

    const vars = {
        buyWood: `Buy Price`,
        sellWood: `Sell Price`,
        maxWood: `Max. wood per cutter`,
        plantWood: `Wood per planter`
    }

    readVal(`gtc`)
        .then(snapshot => {
            const root = snapshot;
            const keys = Object.keys(root);
            for (variable in vars){
                if(keys.includes(variable)){
                    let x = make('div',`class`,`${variable}`,`${vars[variable]}`);
                    let value = make('div',`id`,`${variable}value`,`${root[variable]}`);
                    let inv = make('div',`class`,`varContainer`);
                    inv.appendChild(x);
                    inv.appendChild(value);
                    const up = make('button',`id`,`up${variable}`);
                    up.innerHTML = (`<i class="arrow up"></i>`)
                    const down = make('button',`id`,`down${variable}`);
                    down.innerHTML = (`<i class="arrow down"></i>`)

                    const container = make('div',`class`,`variable`);
                    container.appendChild(down);
                    container.appendChild(inv);
                    container.appendChild(up);
                    variableDiv.appendChild(container)
                    setVarButtons(variable);
                };
            }
            const nextTurn = make(`button`,`id`,`nextTurn`,`Next Turn`)
            body.appendChild(nextTurn)
            nextTurn.addEventListener(`click`, (e) => {
                runTurn();
            })
        })
        .catch(error => console.log(error))
}

function showHouses(){
    const display = make(`div`,`id`,`display`)
    gameBody.appendChild(display);
    
    readVal(`gtc/houses`).then(snapshot => {
        for(let i=1;i<Object.keys(snapshot).length+1;i++){
            const house = make(`div`,`class`,`house`,`${i}`);
            readVal(`gtc/houses/${i}/money`).then(money => {
                const up = make('button',`id`,`${i}moneyup`);
                up.innerHTML = (`<i class="arrow up"></i>`)
                const down = make('button',`id`,`${i}moneydown`);
                down.innerHTML = (`<i class="arrow down"></i>`)
                const houseMoneyContainer = make(`div`,`class`,`houseMoneyContainer`)
                const houseMoney = make(`div`,`id`,`money${i}`,`Money: ${money}`)
                houseMoney.classList.add(`houseMoney`)
                up.addEventListener(`click`, (e) => incrementMoney('up',i))
                down.addEventListener(`click`, (e) => incrementMoney('down',i))
                houseMoneyContainer.appendChild(down);
                houseMoneyContainer.appendChild(houseMoney);
                houseMoneyContainer.appendChild(up);
                house.insertBefore(houseMoneyContainer,house.childNodes[1])
            })
            for(const member of Object.keys(snapshot[i].members)){
                const player = make(`div`,`class`,`player`,`${snapshot[i][`members`][member]['name']}`)
                readVal(`gtc/players/${member}/house`).then(house => {
                    const move = make(`div`,`class`,`move`)
                    getRef(`gtc/houses/${house}/members/${member}`).update({move: null})
                    player.appendChild(move)
                    getRef(`gtc/houses/${house}/members/${member}/move`).on(`value`, (snapshot) => {
                        if(snapshot.val()){
                            move.innerHTML = `Move: ${snapshot.val()}`
                            readVal(`gtc/guards`).then(guards => {
                                document.getElementById(`numGuards`).innerHTML = `Guards: ${guards}`
                            })
                        }
                        else{move.innerHTML = `Move: None`}
                    })
                    move.innerHTML = `Move: None`
                })
                house.appendChild(player)
                }
            display.appendChild(house)
        }
      })
}

function incrementMoney(dir, house){
    readVal(`gtc/houses/${house}/money`)
        .then((snapshot) => {
          const orig = snapshot;
          const obj = {};

          obj[`money`] = dir == "up" ? orig + 1 : orig - 1;
          firebase.database().ref(`gtc/houses/${house}`).update(obj);
          document.querySelector(`#money${house}`).innerHTML = `Money: ${obj.money}`;    
        })
        .catch((error) => {
            console.log(error)
        });
}

function setVarButtons(variable){
    const upButton = document.querySelector(`#up${variable}`)
    upButton.addEventListener('click', (e) => {
        updateVariableValues('up', variable);
    })
    const downButton = document.querySelector(`#down${variable}`)
    downButton.addEventListener('click', async (e) => {
        updateVariableValues('down', variable);
    })
}

function updateVariableValues(dir, variable){
    readVal(`gtc/${variable}`)
        .then((snapshot) => {
          const orig = snapshot;
          const obj = {};

          obj[variable] = dir == "up" ? orig + 1 : orig > 0? orig - 1 : 0;;
          console.log(snapshot)
          console.log(obj.money)
          firebase.database().ref("gtc").update(obj);
          readVal(`gtc/${variable}`).then(snapshot => {
            document.querySelector(`#${variable}value`).innerHTML = `${snapshot}`;
            })
        })
        .catch((error) => {
            console.log(error)
        });
    
}

const callTurn = firebase.functions().httpsCallable(`runTurn`)
function runTurn(){
    document.querySelector(`#display`).remove();
    showHouses();
    callTurn();
}

