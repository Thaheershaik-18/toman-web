// 🔥 ADD YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "YOUR_DATABASE_URL",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

// ---------------- LOGIN ----------------

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => alert("Logged in 🔥"))
        .catch(err => alert(err.message));
}

function logout() {
    auth.signOut();
    alert("Logged out 👋");
}

// ---------------- GANG SYSTEM ----------------

function createGang() {
    const user = auth.currentUser;

    if (!user) return alert("Login first!");

    db.collection("gangs").add({
        name: "Toman",
        captain: user.uid,
        invite: "TOM" + Math.floor(Math.random()*999),
        members: [user.uid]
    });

    alert("Gang Created 🔥");
}

function joinGang() {
    const code = document.getElementById("code").value;

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
    const text = document.getElementById("msg").value;

    if (!auth.currentUser) return alert("Login first!");

    rtdb.ref("chat").push({
        user: auth.currentUser.displayName,
        text: text
    });

    document.getElementById("msg").value = "";
}

rtdb.ref("chat").on("value", snap => {
    let html = "";
    snap.forEach(d => {
        html += `<p>${d.val().user}: ${d.val().text}</p>`;
    });

    document.getElementById("chat").innerHTML = html;
});

// ---------------- BATTLE ----------------

function fight() {
    let my = Math.floor(Math.random()*100);
    let enemy = Math.floor(Math.random()*100);

    let result = my > enemy ? "🔥 YOU WIN" : "💀 YOU LOSE";

    document.getElementById("result").innerText =
        `${result} (${my} vs ${enemy})`;

    updateXP(result);
}

// ---------------- XP SYSTEM ----------------

function updateXP(result) {
    if (!auth.currentUser) return;

    let ref = db.collection("users").doc(auth.currentUser.uid);

    db.runTransaction(async (t) => {
        let doc = await t.get(ref);

        let points = doc.exists ? doc.data().points || 0 : 0;

        let newPoints = result.includes("WIN") ? points + 100 : points - 50;

        t.set(ref, { points: newPoints }, { merge: true });
    });
}

// ---------------- FEED ----------------

function post() {
    let url = document.getElementById("img").value;

    if (!url) return alert("Enter image URL");

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
