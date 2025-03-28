import os
from flask import Flask, jsonify, request
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = 'AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg'

# Initialize the Client y
genai.configure(api_key=GEMINI_API_KEY)


@app.route('/api/gemini', methods=['POST'])

@app.route('/api/gemini', methods=['POST'])

def call_gemini():
    data = request.get_json(force=True)
    user_prompt = data.get('prompt', "")
    system_prompt = data.get('system', "")

    # Combine prompt and system instructions
    full_prompt = f"{system_prompt.strip()}\n\nUser: {user_prompt.strip()}"

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(full_prompt)
        return jsonify({"answer": response.text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Start your local server on port 3000
    app.run(port=3000, debug=True)



