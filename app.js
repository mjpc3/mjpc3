// ⚠️ Use your own token here
const GITHUB_TOKEN = "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";
const GIST_API = "https://api.github.com/gists";

let currentRoom = null;
let messages = [];

const createBtn = document.getElementById("createRoomBtn");
const joinBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomCodeInput");
const chatContainer = document.getElementById("chatContainer");
const roomDisplay = document.getElementById("roomDisplay");
const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendMsgBtn");

// Create Room
createBtn.addEventListener("click", async () => {
  try {
    const body = {
      description: "AICE Room",
      public: false,
      files: { "room.json": { content: JSON.stringify({ messages: [] }) } }
    };

    const res = await fetch(GIST_API, {
      method: "POST",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      alert("Room created! Share this code: " + data.id);
      joinRoom(data.id);
    } else {
      console.error(data);
      alert("Error creating room: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Network error. See console.");
  }
});

// Join Room
joinBtn.addEventListener("click", () => {
  const code = roomInput.value.trim();
  if (code) joinRoom(code);
});

async function joinRoom(roomCode) {
  try {
    const res = await fetch(`${GIST_API}/${roomCode}`, {
      headers: { "Authorization": `token ${GITHUB_TOKEN}` }
    });
    const data = await res.json();

    if (res.ok && data.files["room.json"]) {
      currentRoom = roomCode;
      messages = JSON.parse(data.files["room.json"].content).messages || [];
      roomDisplay.innerText = currentRoom;
      chatContainer.classList.remove("hidden");
      renderMessages();
    } else {
      alert("Room not found!");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. See console.");
  }
}

// Send Message
sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const msg = msgInput.value.trim();
  if (!msg || !currentRoom) return;
  messages.push(msg);
  renderMessages();
  msgInput.value = "";

  const body = {
    files: { "room.json": { content: JSON.stringify({ messages }, null, 2) } }
  };

  await fetch(`${GIST_API}/${currentRoom}`, {
    method: "PATCH",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

// Render messages
function renderMessages() {
  messagesDiv.innerHTML = "";
  messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = m;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
