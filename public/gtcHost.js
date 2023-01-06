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
    body.appendChild(gameBody);
    showVars();
    showHouses();
}
  
const runTurn = firebase.functions().httpsCallable(`runTurn`)
function showVars(){
    const vars = {
        buyWood: `Buy Price`,
        maxWood: `Maximum wood per cutter`,
        plantWood: `Wood per planter`,
        sellWood: `Sell Price`,
        turn: `Turn`
    }

    let varContainer = make('div',`id`,`varContainer`);
    let subTitle = make('div',`id`,`subTitle`,`Variables`);
    varContainer.appendChild(subTitle);
    let variableDiv = make('div',`class`,`container`);
    varContainer.appendChild(variableDiv);
    gameBody.appendChild(varContainer);

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
            gameBody.appendChild(nextTurn)
            nextTurn.addEventListener(`click`, (e) => {
                runTurn();
            })
        })
        .catch(error => console.log(error))
}

function showHouses(){
    firebase.database().ref(`gtc/houses`).once("value").then(snapshot => {
        let i = 1;
        const display = make(`div`,`id`,`display`)
        while (i<Object.keys(snapshot.val()).length+1){
            const house = make(`div`,`class`,`house`,`${i}`);
            for(const member of Object.keys(snapshot.val()[i][`members`])){
                const player = make(`div`,`class`,`player`,`${snapshot.val()[i][`members`][member]['name']}`)
                house.appendChild(player)
                }
            display.appendChild(house)
            i++;
        }
        gameBody.appendChild(display)
      })
}

const changeVars = firebase.functions().httpsCallable('changeVars');
function setVarButtons(variable){
    const upButton = document.querySelector(`#up${variable}`)
    upButton.addEventListener('click', async (e) => {
        await updateVariableValues('up', variable);
    })
    const downButton = document.querySelector(`#down${variable}`)
    downButton.addEventListener('click', async (e) => {
        await updateVariableValues('down', variable);
    })
}

async function updateVariableValues(dir, variable){
    await changeVars({dir: dir, var: variable});
    firebase.database().ref(`gtc/${variable}`).once("value").then(snapshot => {
        document.querySelector(`#${variable}value`).innerHTML = `${snapshot.val()}`;
    })
}

