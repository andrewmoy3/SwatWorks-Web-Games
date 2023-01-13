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

const welcome = make(`div`,`id`,`title`,`Welcome to Governing the Commons!`);

const waitingRoom = make(`div`,`id`,`waitingRoom`);
const title = make(`div`,`class`,`title`,`Players`);
const playerList = make(`div`,`id`,`playerList`);
waitingRoom.appendChild(title);
waitingRoom.appendChild(playerList);

let body = select(`body`);
body.append(welcome);

const createGame = make(`button`,`id`,`createGame`,`Create New Game`)
const continueGame = make(`button`,`id`,`continueGame`,`Continue Game`)

continueGame.addEventListener(`click`, e => {
    welcome.remove();
    createGame.remove();
    continueGame.remove();
    body.appendChild(header);
    body.appendChild(gameBody);
    showVars();
    showHouses();
})
createGame.addEventListener(`click`, e => {
    createGame.remove();
    continueGame.remove();
    cleanData().then(() => {
        // const addPlayers = firebase.functions().httpsCallable('addPlayers');
        // addPlayers();
        let startGame = make('button',`id`,`startGame`,`Start Game!`);
        getRef('gtc/players').on("child_added", (snapshot) => {
            let player = make(`div`,`class`,`player`,`${snapshot.val().name}`);
            playerList.appendChild(player);
        });
        body.append(waitingRoom);
        body.appendChild(startGame);
        startGame.addEventListener('click', (e) => {
            welcome.remove();
            waitingRoom.remove();
            startGame.remove();
            initialize()
        })
    })
})
body.append(createGame,continueGame)

const gameBody = make(`div`,`id`,`gameBody`);
const header = make(`div`,`id`,`header`,`Governing the Commons`);


const delay = ms => new Promise(res => setTimeout(res, ms));
const test = firebase.functions().httpsCallable('test');
const cleanData = firebase.functions().httpsCallable('cleanData');
const initGame = firebase.functions().httpsCallable('initGTC');
async function initialize() {
    await initGame();
    await delay(1000);
    body.appendChild(header);
    body.appendChild(gameBody);
    showVars();
    showHouses();
}
  
function showVars(){
    const leftSideContainer = make('div',`id`,`constContainer`);

    //variables box
    const varContainer = make('div',`id`,`varContainer`);
    const variableDiv = make('div',`class`,`container`);
    const subTitle = make('div',`class`,`subTitle`,`Variables`);
    varContainer.appendChild(subTitle);
    varContainer.appendChild(variableDiv);

    //constants box
    const violationsup = make('button',`id`,`violationsup`);
    violationsup.innerHTML = (`<i class="arrow up"></i>`)
    violationsup.addEventListener(`click`, e => {
        readVal(`gtc`).then(snap => {
            document.getElementById(`violations`).innerHTML = `Violations: ${snap.violations + 1}`
            getRef(`gtc`).update({violations: snap.violations + 1})
            updateChanceCalc(snap.guards,snap.violations + 1);
        })
    })
    const violationsdown = make('button',`id`,`violationsdown`);
    violationsdown.innerHTML = (`<i class="arrow down"></i>`);
    violationsdown.addEventListener(`click`, e => {
        readVal(`gtc`).then(snap => {
            document.getElementById(`violations`).innerHTML = `Violations: ${snap.violations - 1}`
            getRef(`gtc`).update({violations: snap.violations - 1})
            updateChanceCalc(snap.guards,snap.violations - 1);
        })
    })
    const violationsContainer = make(`div`,`id`,`violationsContainer`)
    const violations = make(`div`,`id`,`violations`,`Violations: 0`);
    violationsContainer.appendChild(violationsdown)
    violationsContainer.appendChild(violations)
    violationsContainer.appendChild(violationsup)
    const constantDiv = make('div',`id`,`constants`);
    const constantTitle = make('div',`class`,`subTitle`,`Constants`);
    const numGuards = make(`div`,`id`,`numGuards`,`Guards: 0`);
    const turnNumber = make(`div`,`id`,`turnNumber`,`Turn Number: 1`);
    numGuards.classList.add(`constant`);
    violations.classList.add(`constant`);

    getRef(`gtc/guards`).on(`value`, (snapshot) => {
        numGuards.innerHTML = `Guards: ${snapshot.val()}`
    })
    getRef(`gtc/turn`).on(`value`, (snapshot) => {
        turnNumber.innerHTML = `Turn Number: ${snapshot.val()}`
    })

    constantDiv.appendChild(constantTitle);
    constantDiv.appendChild(numGuards);
    constantDiv.appendChild(violationsContainer);
    constantDiv.appendChild(turnNumber);

    //calculation box
    const calcDiv = make('div',`id`,`calc`);
    const calcTitle = make('div',`class`,`subTitle`,`Chance Calculator`);
    const numberDiv = make('div',`id`,`numberDiv`);
    const chance = make('div',`id`,`chance`,`Chance to Catch Violator: 0%`);
    const chanceButton = make('button',`id`,`chanceButton`,`Calculate Number from 1-100`);
    chanceButton.addEventListener(`click`, e => {
        const num = Math.floor(Math.random() * 100);
        const previousNum = document.querySelector(`#randomNum`);
        if(previousNum)previousNum.remove();
        numberDiv.appendChild(make(`div`,`id`,`randomNum`,num));
    })
    calcDiv.appendChild(calcTitle)
    calcDiv.appendChild(chance)
    numberDiv.appendChild(chanceButton)
    calcDiv.appendChild(numberDiv);

    //custom rules box
    const customRulesDiv = make('div',`id`,`customRulesDiv`);
    const rulesTitle = make('div',`class`,`subTitle`,`Custom Rules`);
    const form = document.createElement(`form`);
    form.setAttribute(`id`,`customRules`)
    form.innerHTML = 
    `
    <label for="rules">Enter Rule:</label>
    <input type="text" id="rules">
    <button type="submit">Add Rule</button>
    `
    customRulesDiv.appendChild(rulesTitle);
    customRulesDiv.appendChild(form);
    form.addEventListener("submit", e => {
        e.preventDefault();
        const rule = document.getElementById("rules").value;
        const newRule = make(`div`,`class`,`rule`,rule)
        customRulesDiv.insertBefore(newRule, customRulesDiv.childNodes[1])
      });

    leftSideContainer.appendChild(varContainer);
    leftSideContainer.appendChild(constantDiv);
    leftSideContainer.appendChild(calcDiv);
    leftSideContainer.appendChild(customRulesDiv);
    gameBody.appendChild(leftSideContainer);

    const vars = {
        buyWood: `Buy Price`,
        sellWood: `Sell Price`,
        maxWood: `Max. wood per cutter`,
        plantWood: `Wood per planter`,
        forest: `Trees in Forest`,
        growthRate: `Forest Growth Rate`
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
            getRef(`gtc/forest`).on(`value`, (snapshot) => {
                document.querySelector(`#forestvalue`).innerHTML = `${snapshot.val()}`
            })
            const freezeTurn = make(`button`,`id`,`freezeTurn`,`Freeze`)
            body.appendChild(freezeTurn)
            freezeTurn.addEventListener(`click`, (e) => {
                readVal(`gtc/freeze`).then(freeze => {
                    if(freeze == `false`){
                        getRef(`gtc`).update({freeze: `true`});
                        freezeTurn.innerHTML = `Unfreeze`
                    }
                    else{
                        getRef(`gtc`).update({freeze: `false`})
                        freezeTurn.innerHTML = `Freeze`
                    }
                })
            })
            const nextTurn = make(`button`,`id`,`nextTurn`,`Next Turn`)
            body.appendChild(nextTurn)
            nextTurn.addEventListener(`click`, (e) => {
                changeTurn();
            })
        })
        .catch(error => console.log(error))
}

function showHouses(){
    const display = make(`div`,`id`,`display`)
    gameBody.appendChild(display);
    
    readVal(`gtc/houses`).then(snapshot => {
        for(let i=1;i<Object.keys(snapshot).length+1;i++){
            const house = make(`div`,`id`,`house${i}`,`${i}`);
            house.classList.add(`house`)
            // readVal(`gtc/houses/${i}/money`).then(money => {
            
            //money counter
            const moneyup = make('button',`id`,`${i}moneyup`);
            moneyup.innerHTML = (`<i class="arrow up"></i>`)
            const moneydown = make('button',`id`,`${i}moneydown`);
            moneydown.innerHTML = (`<i class="arrow down"></i>`)
            const money = snapshot[i].money;
            const houseMoneyContainer = make(`div`,`class`,`houseMoneyContainer`)
            const houseMoney = make(`div`,`id`,`money${i}`,`Money: ${money}`)
            houseMoney.classList.add(`houseMoney`)
            moneyup.addEventListener(`click`, (e) => increment('up',i,`money`,`Money`))
            moneydown.addEventListener(`click`, (e) => increment('down',i,`money`,`Money`))
            houseMoneyContainer.appendChild(moneydown);
            houseMoneyContainer.appendChild(houseMoney);
            houseMoneyContainer.appendChild(moneyup);
            house.insertBefore(houseMoneyContainer,house.childNodes[1])

            //currentWood counter
            const woodup = make('button',`id`,`${i}woodup`);
            woodup.innerHTML = (`<i class="arrow up"></i>`)
            const wooddown = make('button',`id`,`${i}wooddown`);
            wooddown.innerHTML = (`<i class="arrow down"></i>`)
            const wood = snapshot[i].currentWood;
            const currentWoodContainer = make(`div`,`class`,`currentWoodContainer`)
            const currentWood = make(`div`,`id`,`currentWood${i}`,`Wood: ${wood}`)
            getRef(`gtc/houses/${i}/currentWood`).on(`value`, snapshot => {
                currentWood.innerHTML = `Wood: ${snapshot.val()}`
            })
            currentWood.classList.add(`currentWood`)
            woodup.addEventListener(`click`, (e) => increment('up',i,`currentWood`,`Wood`))
            wooddown.addEventListener(`click`, (e) => increment('down',i,`currentWood`,`Wood`))
            currentWoodContainer.appendChild(wooddown);
            currentWoodContainer.appendChild(currentWood);
            currentWoodContainer.appendChild(woodup);
            house.insertBefore(currentWoodContainer,house.childNodes[2])

            for(const member of Object.keys(snapshot[i].members)){
                const player = make(`div`,`class`,`player`,`${snapshot[i][`members`][member]['name']}`)
                readVal(`gtc/players/${member}/house`).then(house => {
                    const move = make(`div`,`class`,`move`)
                    getRef(`gtc/houses/${house}/members/${member}`).update({move: null})
                    player.appendChild(move)
                    getRef(`gtc/houses/${house}/members/${member}/move`).on(`value`, (snapshot) => {
                        if(snapshot.val()){
                            move.innerHTML = `Move: ${snapshot.val()}`
                            readVal(`gtc`).then(snapshot => {
                                const guards = snapshot.guards;
                                const violations = snapshot.violations;
                                document.getElementById(`numGuards`).innerHTML = `Guards: ${guards}`
                                document.getElementById(`violations`).innerHTML = `Violations: ${violations}`
                                updateChanceCalc(guards,violations)
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
        for(const house of Object.keys(snapshot)){
            if(snapshot[house].alive == `false`){
                const houseEle = document.querySelector(`#house${house}`)
                houseEle.classList.add(`eliminated`);
            }
            }
      })
}

function increment(dir, house, item, name){
    readVal(`gtc/houses/${house}/${item}`)
        .then((snapshot) => {
          const orig = snapshot;
          const obj = {};

          obj[item] = dir == "up" ? orig + 1 : orig - 1;
          firebase.database().ref(`gtc/houses/${house}`).update(obj);
          document.querySelector(`#${item}${house}`).innerHTML = `${name}: ${obj[item]}`;    
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
          firebase.database().ref("gtc").update(obj);
          readVal(`gtc/${variable}`).then(snapshot => {
            document.querySelector(`#${variable}value`).innerHTML = `${snapshot}`;
            })
        })
        .catch((error) => {
            console.log(error)
        });
    
}

function updateChanceCalc(guards,violations){
    const percent = violations!=0 ? Math.round(guards/(2*violations) * 100) : `NA`;
    const chance = percent > 100 ? `100%` : percent + `%`;
    document.getElementById(`chance`).innerHTML = `Chance to Catch Violator: ${chance}`
}

const runTurn = firebase.functions().httpsCallable(`runTurn`)
async function changeTurn(){
    await runTurn();
    await delay(2000);
    document.querySelector(`#display`).remove();
    showHouses();
}

