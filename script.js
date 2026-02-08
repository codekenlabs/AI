import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0";

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const btn = document.getElementById("sendBtn");
const vaicon = document.getElementById("vaicon");

let lastPrompt = "";
let speaking = false;

function setState(s="") {
  vaicon.className = "vaicon " + s;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  u.rate = 1;
  setState("talking");
  speaking = true;
  u.onend = () => {
    speaking = false;
    setState("");
  };
  speechSynthesis.speak(u);
}

function addAI(text) {
  const div = document.createElement("div");
  div.className = "msg ai";
  div.innerHTML = `
    <div class="text">${text}</div>
    <div class="actions">
      <span onclick="copyText(this)">📋 Salin</span>
      <span onclick="retry()">🔄 Coba lagi</span>
      <span onclick="voice(this)">🔊 Voice</span>
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

window.copyText = el => {
  const text = el.parentElement.previousElementSibling.textContent;
  navigator.clipboard.writeText(text);
  el.textContent = "✅ Disalin";
  setTimeout(()=> el.textContent="📋 Salin", 1200);
};

window.voice = el => {
  const text = el.parentElement.previousElementSibling.textContent;
  speak(text);
};

window.retry = () => {
  if (lastPrompt) generate(lastPrompt);
};

addAI("Loading AI beneran... 🤖");
btn.disabled = input.disabled = true;
setState("thinking");

const ai = await pipeline("text-generation","Xenova/distilgpt2");

chat.innerHTML = "";
addAI("AI siap. Mirip ChatGPT 😈");
btn.disabled = input.disabled = false;
setState("");

async function generate(prompt) {
  lastPrompt = prompt;
  btn.disabled = input.disabled = true;
  setState("thinking");

  try {
    const res = await ai(prompt, {
      max_new_tokens: 100,
      temperature: 0.9,
      top_p: 0.95
    });

    setState("");
    const text = res[0].generated_text.replace(prompt,"").trim();
    addAI(text);
    speak(text);
  } catch {
    addAI("Error dikit bro 😅 refresh aja");
    setState("");
  }

  btn.disabled = input.disabled = false;
}

btn.onclick = () => {
  if (!input.value.trim()) return;
  const t = input.value.trim();
  input.value = "";
  addUser(t);
  generate(t);
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter") btn.onclick();
});
