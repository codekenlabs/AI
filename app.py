from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)
openai.api_key = os.environ.get("OPENAI_API_KEY")  # jangan masukin langsung

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    if not user_msg:
        return jsonify({"answer": "Teks kosong!"})

    # Prompt khusus: AI pinter, bisa buat script Python
    prompt = f"""
    Kamu AI GPT mirip ChatGPT. Jawab santai, jelas, dan waras.
    Jika user minta buat script / kode Python, buat langsung script yang valid
    dan beri penjelasan singkat. 
    User request: {user_msg}
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4.1",
            messages=[{"role":"user","content":prompt}],
            max_tokens=700,
            temperature=0.7
        )

        answer = response.choices[0].message.content

        # Simpan file Python kalau ada kode
        if "```python" in answer:
            code = answer.split("```python")[1].split("```")[0]
            with open("generated/generated_script.py","w",encoding="utf-8") as f:
                f.write(code)

        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"answer": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
