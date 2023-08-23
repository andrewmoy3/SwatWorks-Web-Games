// function showSignIn() {
//   let games = document.querySelector("#games");
//   let parent = document.querySelector(".optionsList");

//   let form = document.createElement(`form`);
//   form.setAttribute(`id`, `signIn`);
//   form.innerHTML = `
//     <label for="username">Enter Username:</label>
//     <input type="text" id="username">
//     <button type="submit">Sign In</button>
//     `;

//   if (games) {
//     games.remove();
//   }
//   parent.appendChild(form);

//   addLoginFunctionality();
// }

// //sign in anonymously
// function addLoginFunctionality() {
//   document.querySelector("#signIn").addEventListener("submit", (e) => {
//     e.preventDefault();
//     let user = firebase.auth().currentUser;
//     const username = document.getElementById("username").value;
//     if (!user) {
//       firebase
//         .auth()
//         .signInAnonymously()
//         .then(() => {
//           update(username);
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       update(username);
//     }
//   });
// }

import React from "react";

export default function SignIn() {
  return <>Sign in</>;
}
