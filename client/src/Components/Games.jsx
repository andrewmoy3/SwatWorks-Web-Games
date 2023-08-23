import React from "react";
import { Link } from "react-router-dom";

export default function Games({ setAuth }) {
  return (
    <>
      <div id="games">
        <button className="game-button">
          <Link to={"/gtc"}>Governing The Commons</Link>
        </button>

        <button>Postwar Politics</button>
        <button>Korean Factions</button>
        <button>Warlord China</button>
        <button>Japanese Foreign Policy</button>
        <button>Insurgencies</button>
        <button id="backButton" onClick={() => setAuth(false)}>
          Back
        </button>
      </div>
    </>
  );
}

// function showGames() {
//   let signIn = document.querySelector("#signIn");
//   let parent = document.querySelector(".optionsList");

//   const gameList = document.createElement(`div`);
//   gameList.setAttribute(`id`, `games`);
//   gameList.innerHTML = `
//     <button onclick="window.location.href='gtc.html'">Governing The Commons</button>
//     <button>Postwar Politics</button>
//     <button>Korean Factions</button>
//     <button>Warlord China</button>
//     <button>Japanese Foreign Policy</button>
//     <button>Insurgencies</button>
//     <button id="backButton">Back</button>
//     `;
//   if (signIn) {
//     signIn.remove();
//   }
//   parent.appendChild(gameList);
//   addBackButtonFunctionality();
// }
