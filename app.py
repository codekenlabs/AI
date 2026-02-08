from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)
openai.api_key = os.environ.get("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")  # jangan masukin langsung

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    if not user_msg:
        return jsonify({"answer": "Teks kosong!"})

    prompt = f"""
    Kamu AI GPT mirip ChatGPT. Jawab santai, jelas, dan waras.
    Jika user minta buat script / kode Python, tampilkan langsung script yang valid
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
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"answer": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
