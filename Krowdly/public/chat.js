// chat.js

let chatPollingInterval = null;

// Send a chat message
export function sendMessage(currentUser, chatUserSelectId, chatInputId, chatBoxId) {
  const text = document.getElementById(chatInputId).value;
  const to = document.getElementById(chatUserSelectId).value;
  if (!text) return;

  const key = `chat_${[currentUser.id, to].sort().join("_")}`;
  const msgs = JSON.parse(localStorage.getItem(key) || "[]");
  msgs.push({ from: currentUser.id, text });
  localStorage.setItem(key, JSON.stringify(msgs));
  document.getElementById(chatInputId).value = "";
  loadChat(currentUser, to, chatBoxId);
}

// Load messages for selected user
export function loadChat(currentUser, to, chatBoxId) {
  const key = `chat_${[currentUser.id, to].sort().join("_")}`;
  const msgs = JSON.parse(localStorage.getItem(key) || "[]");
  const chatBox = document.getElementById(chatBoxId);
  chatBox.innerHTML = "";
  msgs.forEach(m => {
    const div = document.createElement("div");
    div.style.textAlign = m.from === currentUser.id ? "right" : "left";
    div.textContent = m.text;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Start polling messages every 2 seconds
export function startChatPolling(currentUser, chatUserSelectId, chatBoxId) {
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(() => {
    const to = document.getElementById(chatUserSelectId).value;
    if (to) loadChat(currentUser, to, chatBoxId);
  }, 2000);
}

// Optional: call when user selects a different chat partner
export function bindChatUserChange(currentUser, chatUserSelectId, chatBoxId) {
  document.getElementById(chatUserSelectId).onchange = () => {
    const to = document.getElementById(chatUserSelectId).value;
    if (to) loadChat(currentUser, to, chatBoxId);
  };
}