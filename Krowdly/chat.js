// chat.js
let socket = null;
let currentUser = null;

export function initChat(user) {
  currentUser = user;

  socket = io("https://krowdly.vercel.app", { auth: { token: localStorage.getItem("krowdly_token") } });

  socket.on("receive_message", (msg) => {
    addMessage(msg.text, false);
  });

  startChatPolling();
}

function addMessage(text, isMine) {
  const div = document.createElement("div");
  div.style.textAlign = isMine ? "right" : "left";
  div.style.margin = "5px 0";
  div.textContent = text;
  document.getElementById("chatBox").appendChild(div);
  document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
}

export function sendMessage() {
  const textInput = document.getElementById("chatInput");
  const toUser = document.getElementById("chatUserSelect").value;
  const text = textInput.value;
  if (!text || !toUser) return;

  socket.emit("send_message", { to: toUser, text });
  addMessage(text, true);
  textInput.value = "";
}

export function startChatPolling() {
  const select = document.getElementById("chatUserSelect");
  if (!select) return;

  select.onchange = () => {
    loadChat(select.value);
  };

  setInterval(() => {
    if (select.value) loadChat(select.value);
  }, 2000);
}

function loadChat(toUserId) {
  const key = `chat_${[currentUser.id, toUserId].sort().join("_")}`;
  const msgs = JSON.parse(localStorage.getItem(key) || "[]");
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  msgs.forEach((m) => {
    const div = document.createElement("div");
    div.style.textAlign = m.from === currentUser.id ? "right" : "left";
    div.style.margin = "3px 0";
    div.textContent = m.text;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}