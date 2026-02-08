const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let lastUserMessage = "";

function addMsg(text, role){
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function generate(message){
  lastUserMessage = message;
  addMsg("AI lagi mikir...", "ai");

  try{
    const res = await fetch("/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message})
    });

    const data = await res.json();
    chat.lastChild.remove(); // hapus "lagi mikir"
    addMsg(data.answer,"ai");

    // Voice TTS otomatis
    const utter = new SpeechSynthesisUtterance(data.answer);
    utter.lang="id-ID";
    speechSynthesis.speak(utter);

  }catch{
    chat.lastChild.remove();
    addMsg("Gagal bro 😅 coba lagi","ai");
  }
}

sendBtn.onclick = ()=>{
  const msg = input.value.trim();
  if(!msg) return;
  addMsg(msg,"user");
  input.value="";
  generate(msg);
};

input.addEventListener("keydown", e=>{
  if(e.key==="Enter") sendBtn.click();
});
