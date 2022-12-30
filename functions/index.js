const admin = require("firebase-admin");
// const {firebaseConfig} = require("firebase-functions");

const functions = require("firebase-functions");

admin.initializeApp();

exports.randomNumber = functions.https.onRequest((request, response) => {
  const number = Math.round(Math.random()*100);
  console.log(number);
  response.send(number.toString());
});

exports.joinGame = functions.https.onCall((data, context) => {
  const playerId = context.auth.uid;
  const username = context.auth.token.name;
  const playerRef = admin.database().ref(`${data.game}/players/${playerId}`);
  playerRef.set({
    id: playerId,
    name: username,
  }).then(() => {
    console.log("Data added to the database");
    return {result: "Success"};
  }).catch((error) => {
    console.error(error);
    return {result: "Error"};
  });
});
