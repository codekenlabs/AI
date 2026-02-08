import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.8.0";

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");
const vaicon = document.getElementById("vaicon");

let lastPrompt = "";

function setState(s="") {
  vaicon.className = "vaicon " + s;
}

function speak(text) {
  if (!speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  setState("talking");
  u.onend = () => setState("");
  speechSynthesis.speak(u);
}

function addUser(t) {
  const d = document.createElement("div");
  d.className = "msg user";
  d.textContent = t;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function addAI(t) {
  const d = document.createElement("div");
  d.className = "msg ai";
  d.innerHTML = `
    <div>${t}</div>
    <div class="actions">
      <span onclick="copy(this)">📋 Salin</span>
      <span onclick="retry()">🔄 Coba lagi</span>
      <span onclick="voice(this)">🔊 Voice</span>
    </div>`;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

window.copy = el => {
  navigator.clipboard.writeText(el.parentElement.previousElementSibling.textContent);
  el.textContent = "✅";
  setTimeout(()=>el.textContent="📋 Salin",1000);
};

window.voice = el => {
  speak(el.parentElement.previousElementSibling.textContent);
};

window.retry = () => {
  if (lastPrompt) generate(lastPrompt);
};

addAI("Loading AI waras... 🤖");
send.disabled = input.disabled = true;
setState("thinking");

const ai = await pipeline(
  "text-generation",
  "Xenova/SmolLM2-135M-Instruct"
);

chat.innerHTML = "";
addAI("AI siap. Versi waras 😎");
send.disabled = input.disabled = false;
setState("");

async function generate(text) {
  lastPrompt = text;
  send.disabled = input.disabled = true;
  setState("thinking");

  const prompt = `
Kamu adalah AI asisten.
Jawab singkat, jelas, tidak mengulang kata.
Gunakan bahasa Indonesia santai.

User: ${text}
AI:
`;

  try {
    const r = await ai(prompt, {
      max_new_tokens: 120,
      temperature: 0.6,
      top_p: 0.9,
      repetition_penalty: 1.35,
      no_repeat_ngram_size: 3
    });

    let out = r[0].generated_text.replace(prompt,"").trim();
    if (out.length > 500) out = out.slice(0,500)+"…";

    addAI(out);
    speak(out);
  } catch {
    addAI("Error dikit bro 😅");
  }

  send.disabled = input.disabled = false;
  setState("");
}

send.onclick = () => {
  if (!input.value.trim()) return;
  const t = input.value.trim();
  input.value = "";
  addUser(t);
  generate(t);
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter") send.onclick();
});
