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
  admin.database().ref('gtc').update({forest: 100, turn: 1})

  admin.database().ref('gtc/players').once('value').then(snapshot => {
    const playersArr = Object.keys(snapshot.val())
    const numPlayers = playersArr.length;
    const numHouses = (numPlayers - 1) % 4 + 1;
    for(let i=0;i<numPlayers;i++){
      let playerId = playersArr[i];
      let playerName = snapshot.val()[playerId].name;
      admin.database().ref(`gtc/houses/${playersArr[i]}`).set({name: playerName})
    }
    // for(const id in snapshot.val()){
    //   let playerName = snapshot.val()[id].name;
    //   let playerId = id;
    // }
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
