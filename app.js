// 🔥 FIREBASE CONFIG (APNA DALNA HAI)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "YOUR_DATABASE_URL",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// ---------------- LOGIN ----------------

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => alert("Login Success 🔥"))
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut();
    alert("Logged out 👋");
}

// ---------------- GANG SYSTEM ----------------

function createGang() {
    if (!auth.currentUser) return alert("Login first!");

    db.collection("gangs").add({
        name: "Toman",
        captain: auth.currentUser.uid,
        invite: "TOM" + Math.floor(Math.random()*999),
        members: [auth.currentUser.uid]
    });

    alert("Gang Created 🔥");
}

function joinGang() {
    let code = document.getElementById("code").value;

    db.collection("gangs").where("invite", "==", code)
    .get().then(snap => {

        if (snap.empty) return alert("Invalid Code ❌");

        let doc = snap.docs[0];
        let members = doc.data().members;

        if (!members.includes(auth.currentUser.uid)) {
            members.push(auth.currentUser.uid);
            doc.ref.update({members});
            alert("Joined Gang ✅");
        }
    });
}

// ---------------- CHAT ----------------

function sendMessage() {
    let text = document.getElementById("msg").value;

    if (!text) return;
    if (!auth.currentUser) return alert("Login first!");

    rtdb.ref("chat").push({
        user: auth.currentUser.displayName,
        text: text
    });

    document.getElementById("msg").value = "";
}

// 💬 CHAT BUBBLES
rtdb.ref("chat").on("value", snap => {
    let html = "";
    let current = auth.currentUser;

    snap.forEach(d => {
        let data = d.val();
        let isMe = current && data.user === current.displayName;

        html += `
            <div class="msg ${isMe ? 'me' : 'other'}">
                ${data.text}
            </div>
        `;
    });

    document.getElementById("chat").innerHTML = html;
});

// ---------------- ⚔️ BATTLE SYSTEM (HP BAR) ----------------

let myHP = 100;
let enemyHP = 100;

function fight() {
    let myAttack = Math.floor(Math.random()*20);
    let enemyAttack = Math.floor(Math.random()*20);

    enemyHP -= myAttack;
    myHP -= enemyAttack;

    if (enemyHP < 0) enemyHP = 0;
    if (myHP < 0) myHP = 0;

    document.getElementById("result").innerHTML = `
        🧑 You: ${myHP} ❤️
        <div class="hp-bar" style="width:${myHP}%"></div>
        
        👿 Enemy: ${enemyHP} 💀
        <div class="hp-bar" style="width:${enemyHP}%"></div>
    `;

    if (myHP <= 0 || enemyHP <= 0) {
        let win = myHP > enemyHP;
        alert(win ? "🔥 YOU WIN" : "💀 YOU LOSE");

        myHP = 100;
        enemyHP = 100;
    }
}

// ---------------- FEED ----------------

function post() {
    let url = document.getElementById("img").value;

    if (!url) return alert("Enter image URL");
    if (!auth.currentUser) return alert("Login first!");

    db.collection("posts").add({
        user: auth.currentUser.uid,
        img: url
    });

    document.getElementById("img").value = "";
}

db.collection("posts").onSnapshot(snap => {
    let html = "";

    snap.forEach(doc => {
        html += `<img src="${doc.data().img}" width="120">`;
    });

    document.getElementById("feed").innerHTML = html;
});
