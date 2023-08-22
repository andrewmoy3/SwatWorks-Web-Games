const admin = require("firebase-admin");
// const {firebaseConfig} = require("firebase-functions");

const functions = require("firebase-functions");

admin.initializeApp();

exports.initGTC = functions.https.onCall((data, context) => {
  admin.database().ref("gtc/players").once("value")
      .then((snapshot) => {
        // creates the houses in database
        const playersArr = snapshot.val() ? Object.keys(snapshot.val()) : [];
        const numPlayers = playersArr.length;
        const numHouses = Math.floor((numPlayers + 3) / 4);
        for (let i=1; i<numHouses+1; i++) {
          admin.database().ref(`gtc/houses/${i}`)
              .update({money: 12, currentWood: 0, alive: "true"});
        }

        admin.database().ref("gtc/maxWood").once("value").then((maxWood) => {
          for (let i=0; i<numPlayers; i++) {
            const playerId = playersArr[i];
            const playerName = snapshot.val()[playerId].name;
            const house = i%numHouses+1;
            admin.database().ref(`gtc/players/${playerId}`)
                .update({house: house});
            admin.database().ref(`gtc/houses/${house}/members/\
${playersArr[i]}`).set({name: playerName, gatherWood: maxWood.val()});
          }
        });

        // calculates required amount of wood per house
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

        // initializes initial conditions
        admin.database().ref("gtc").update({
          forest: 100, turn: 1, maxWood: 2, violations: 0,
          plantWood: 1, sellWood: 1, buyWood: 3, guards: 0,
          growthRate: 20, start: Math.random(), freeze: "false"});
      })
      .catch((error) => {
        console.log(error);
      });
});

exports.runTurn = functions.https.onCall((data, context) => {
  // updates turn #, tree count in database
  admin.database().ref("gtc").once("value").then((snapshot) => {
    const currentTurn = snapshot.val().turn;

    // runs through all houses in game
    const buyWood = snapshot.val()["buyWood"];
    const sellWood = snapshot.val()["sellWood"];

    // does all of the computation for each house
    const houses = Object.keys(snapshot.val().houses);
    let forest = snapshot.val().forest;
    for (const house of houses) {
      if (snapshot.val().houses[house].alive == "true") {
        const gatheredWood = snapshot.val().houses[house].currentWood;
        let excessWood;
        if (gatheredWood > forest) {
          excessWood = forest - snapshot.val().houses[house].reqWood;
          forest = 0;
        } else {
          excessWood = gatheredWood - snapshot.val().houses[house].reqWood;
          forest = forest - gatheredWood;
        }
        admin.database().ref("gtc").update({forest: forest});
        const houseRef = admin.database().ref(`gtc/houses/${house}`);
        if (excessWood < 0) {
          const cost = excessWood*buyWood;
          const currentMoney = snapshot.val().houses[house].money;
          const newMoney = currentMoney + cost;
          houseRef.update({money: newMoney});
          if (newMoney<0) {
            houseRef.update({alive: "false"});
          }
        }
        if (excessWood > 0) {
          const sell = excessWood*sellWood;
          const currentMoney = snapshot.val().houses[house].money;
          const newMoney = currentMoney + sell;
          houseRef.update({money: newMoney});
        }
        houseRef.update({currentWood: 0});
        // console.log(snapshot.val().aliveHouses)
        // for (const member of Object.keys
        // (snapshot.val().houses[i]["members"])) {
        //   // const move = snapshot.val()['houses']
        // [i]["members"][member]["move"];
        //   // console.log(maxWood)
        //   admin.database().ref(`gtc/houses/${i}/mem
        // bers/${member}`).update({gatherWood: maxWood});
        // }
      }
    }
    const newForest = Math.floor(forest * ((snapshot.val().growthRate/100)+1));
    admin.database().ref("gtc")
        .update({start: Math.random(), turn: currentTurn+1, violations: 0,
          forest: newForest, freeze: "false", guards: 0});
  });
});


exports.cleanData = functions.https.onCall((data, context) => {
  admin.database().ref("gtc").set({});
});

exports.test = functions.https.onCall((data, context) => {
  console.log("test reached");
});

exports.addPlayers = functions.https.onCall((data, context) => {
  for (let i=0; i<20; i++) {
    admin.database().ref(`gtc/players/${i}`).set({id: i, name: i});
  }
});
// exports.changeVars = functions.https.onCall((data, context) => {
//   return new Promise((resolve, reject) => {
//     const variable = data.var;
//     admin.database().ref(`gtc/${variable}`).once("value")
//         .then((snapshot) => {
//           const orig = snapshot.val();
//           const obj = {};

//           obj[data.var] = data.dir == "up" ? orig
// + 1 : orig > 0? orig - 1 : 0;
//           admin.database().ref("gtc").update(obj);
//           resolve();
//         })
//         .catch((error) => {
//           reject(error);
//         });
//   });
// });

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
