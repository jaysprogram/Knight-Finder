import os
from flask import Flask, jsonify, request
from google import genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = 'AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg'

# Initialize the Client y
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route('/api/gemini', methods=['POST'])

def call_gemini():

    data = request.get_json(force=True)
    user_prompt = data.get('prompt', "")

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_prompt
        )
        # response.text contains the AI-generated text
        return jsonify({"answer": response.text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Start your local server on port 3000
    app.run(port=3000, debug=True)



