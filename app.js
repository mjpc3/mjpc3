let currentRoom = null;

const roomCodeInput = document.getElementById('roomCodeInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const roomInfo = document.getElementById('roomInfo');
const currentRoomCode = document.getElementById('currentRoomCode');
const chatContainer = document.getElementById('chatContainer');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

// Generate a random 6-character room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create room
createRoomBtn.addEventListener('click', () => {
  const roomCode = generateRoomCode();
  const roomRef = ref(db, 'rooms/' + roomCode);
  set(roomRef, { messages: [] })
    .then(() => joinRoom(roomCode))
    .catch(err => alert("Error creating room: " + err));
});

// Join room
joinRoomBtn.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim().toUpperCase();
  if (!roomCode) return alert("Enter room code");
  joinRoom(roomCode);
});

function joinRoom(roomCode) {
  currentRoom = roomCode;
  roomInfo.style.display = 'block';
  chatContainer.style.display = 'flex';
  currentRoomCode.textContent = roomCode;

  const messagesRef = ref(db, 'rooms/' + roomCode + '/messages');
  onValue(messagesRef, snapshot => {
    const data = snapshot.val() || {};
    renderMessages(data);
  });
}

// Leave room
leaveRoomBtn.addEventListener('click', () => {
  currentRoom = null;
  roomInfo.style.display = 'none';
  chatContainer.style.display = 'none';
  messagesContainer.innerHTML = '';
});

// Send message
sendMessageBtn.addEventListener('click', () => {
  sendMessage(messageInput.value);
  messageInput.value = '';
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage(messageInput.value);
    messageInput.value = '';
  }
});

function sendMessage(text) {
  if (!currentRoom || !text) return;
  const messagesRef = ref(db, 'rooms/' + currentRoom + '/messages');
  push(messagesRef, { text, timestamp: Date.now(), sender: 'user' });
}

// Render messages
function renderMessages(messages) {
  messagesContainer.innerHTML = '';
  for (const key in messages) {
    const msg = messages[key];
    const div = document.createElement('div');
    div.className = msg.sender === 'user' ? 'message user' : 'message other';
    div.textContent = msg.text;
    messagesContainer.appendChild(div);
  }
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
