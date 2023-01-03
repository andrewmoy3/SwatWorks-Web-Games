let welcome = document.createElement(`div`);
welcome.setAttribute("id","title")
welcome.appendChild(document.createTextNode(`Welcome to Governing the Commons!`))

console.log(`hjksdfhsdh`)

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
    initialize()
})

async function initialize() {
    await initGame();
    showGame();
}
  
function showGame(){
    const vars = {
        buyWood: `Buy Price`,
        maxWood: `Maximum wood per cutter`,
        plantWood: `Wood per planter`,
        sellWood: `Sell Price`,
        turn: `Turn`
    }

    let subTitle = document.createElement(`div`);
    subTitle.setAttribute("id",`subTitle`)
    subTitle.appendChild(document.createTextNode(`Variables`))
    body.appendChild(subTitle);
    let variableDiv = document.createElement(`div`);
    variableDiv.setAttribute("class",`container`)
    body.appendChild(variableDiv)

    firebase.database().ref(`gtc`).once(`value`)
        .then(snapshot => {
            const root = snapshot.val();
            const keys = Object.keys(root);
            for (variable in vars){
                if(keys.includes(variable)){
                    let x = document.createElement(`div`);
                    x.setAttribute("class",`${variable}`)
                    x.appendChild(document.createTextNode(`${vars[variable]}`))
                    let value = document.createElement(`div`);
                    value.setAttribute("id",`${variable}value`)
                    value.appendChild(document.createTextNode(`${root[variable]}`))
                    let inv = document.createElement(`div`);
                    inv.appendChild(x);
                    inv.appendChild(value);
                    const up = document.createElement(`button`)
                    up.setAttribute('id', `up${variable}`)
                    up.innerHTML = (`<i class="arrow up"></i>`)
                    const down = document.createElement(`button`)
                    down.setAttribute('id', `down${variable}`)
                    down.innerHTML = (`<i class="arrow down"></i>`)

                    let varContainer = document.createElement(`div`)
                    varContainer.classList.add(`variable`)
                    varContainer.appendChild(down);
                    varContainer.appendChild(inv);
                    varContainer.appendChild(up);
                    variableDiv.appendChild(varContainer)
                    setVarButtons(variable);
                };
            }
        })
        .catch(error => console.log(error))
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
        console.log(snapshot.val())
        document.querySelector(`#${variable}value`).innerHTML = `${snapshot.val()}`;
    })
}
// const create = firebase.functions().httpsCallable('addPlayers');
// create()
