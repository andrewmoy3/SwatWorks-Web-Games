const button = document.querySelector('#joinGame');
button.addEventListener('click', (e) => {
    const joinGame = firebase.functions().httpsCallable('joinGame');
    joinGame({game: "gtc"});
    document.querySelector(`#title`).remove();
    document.querySelector(`#joinGame`).remove();
})

console.log("HEKUSFH")
let form = document.createElement(`form`);
  form.setAttribute(`id`, `signIn`);
  form.innerHTML = 
  `
  <div>JLKEHLFHELFL</div>
  `

document.querySelector(`body`).append(form);

