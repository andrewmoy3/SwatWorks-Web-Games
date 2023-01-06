const admin = require("firebase-admin");
// const {firebaseConfig} = require("firebase-functions");

const functions = require("firebase-functions");

admin.initializeApp();

exports.randomNumber = functions.https.onRequest((request, response) => {
  const number = Math.round(Math.random()*100);
  console.log(number);
  response.send(number.toString());
});


exports.initGTC = functions.https.onCall((data, context) => {
  admin.database().ref("gtc").update({forest: 100, turn: 1, maxWood: 2,
    plantWood: 1, sellWood: 1, buyWood: 3, guards: 0, start: Math.random()});
  const players = admin.database().ref("gtc/players");

  players.once("value")
      .then((snapshot) => {
        const playersArr = snapshot.val() ? Object.keys(snapshot.val()) : [];
        const numPlayers = playersArr.length;
        const numHouses = Math.floor((numPlayers + 3) / 4);
        for (let i=1; i<numHouses+1; i++) {
          admin.database().ref(`gtc/houses/${i}`).update({money: 12});
          admin.database().ref(`gtc/houses/${i}/members`).set({});
        }
        for (let i=0; i<numPlayers; i++) {
          const playerId = playersArr[i];
          const playerName = snapshot.val()[playerId].name;
          const house = i%numHouses+1;
          admin.database().ref(`gtc/players/${playerId}`).update({house: house})
          admin.database().ref(`gtc/houses/${house}/members/\
${playersArr[i]}`).set({name: playerName});
        }
        admin.database().ref("gtc/houses").once("value").then((snapshot) => {
          const houses = Object.keys(snapshot.val());
          for (const house of houses) {
            let numMembers = 0;
            const members = Object.keys(snapshot.val()[house]["members"]);
            for (let i=0; i<members.length; i++) {
              numMembers += 1;
            }
            const reqWood = Math.floor((numMembers+1)/2);
            admin.database().ref(`gtc/houses/${house}`)
.update({reqWood: reqWood});
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
});

exports.changeVars = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    const variable = data.var;
    admin.database().ref(`gtc/${variable}`).once("value")
        .then((snapshot) => {
          const orig = snapshot.val();
          const obj = {};

          obj[data.var] = data.dir == "up" ? orig + 1 : orig > 0? orig - 1 : 0;
          admin.database().ref("gtc").update(obj);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
  });
});


exports.addPlayers = functions.https.onCall((data, context) => {
  for (let i=0; i<20; i++) {
    admin.database().ref(`gtc/players/${i}`).set({id: i, name: i});
  }
});

exports.runTurn = functions.https.onCall((data, context) => {
  //updates turn # in database
  admin.database().ref("gtc/turn").once("value").then((snapshot) => {
    const currentTurn = snapshot.val();
    admin.database().ref("gtc")
        .update({start: Math.random(), turn: currentTurn+1});
  });

  let buyWood, plantWood, maxWood, sellwood;
  admin.database().ref(`gtc`).once("value").then(snapshot => {
    buyWood = snapshot.val()[`buyWood`]
    plantWood = snapshot.val()[`plantWood`]
    maxWood = snapshot.val()[`maxWood`]
    sellwood = snapshot.val()[`sellwood`]
  })
  
  //runs through all members in game
  admin.database().ref(`gtc/houses`).once("value").then(snapshot => {
    let i = 1;
    let guards = 0;
    //does all of the computation for each house
    while (i<Object.keys(snapshot.val()).length+1){
      let houseWood = 0;
      for(const member of Object.keys(snapshot.val()[i][`members`])){
        const move = snapshot.val()[i][`members`][member]['move']
        if(move == `guard`) guard++;
        if(move == `plant`) houseWood += plantWood;
        if(move == `gather`) houseWood += maxWood;
        }
        i++;
    }
  })
});


// exports.joinGame = functions.https.onCall((data, context) => {
//   const playerId = context.auth.uid;
//   const username = context.auth.token.name;
//   const playerRef = admin.database().ref(`${data.game}/players/${playerId}`);
//   playerRef.set({
//     id: playerId,
//     name: username,
//   }).then(() => {
//   }).catch((error) => {
//     console.error(error);
//   });
// });

// exports.createGames = functions.https.onCall((data, context) => {
//   console.log("hello")
//   const playerRef = admin.database().ref(`gtc/players/NA`)
//   playerRef.set({NA: "NA"})
// })

// exports.cleanupDisconnectedUsers = functions.database.ref('/players/{uid}')
// .onWrite((change, context) => {
//   console.log("YOU DID IT\n\n\n\n\n\n\n\n")
//   const user = change.after.val();
//   if(!user || !user.isDisconnected) return null;
//   const timeout = 5 * 60 * 1000;
//   const ttl = new Date().getTime() + timeout;
//   return change.after.ref.parent.child('ttl').set(ttl).then(() => {
//     return change.after.ref.parent.child('isDisconnected')
// .onDisconnect().set(true);
//   });
// })
