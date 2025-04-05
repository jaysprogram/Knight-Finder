import os
from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = 'AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg'
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}'


import json  # Make sure this is imported


@app.route('/api/gemini', methods=['POST'])
def call_gemini():
    try:
        data = request.get_json(force=True)
        user_prompt = data.get('prompt', "")
        system_prompt = data.get('system', "")

        # Comprehensive system prompt with explicit formatting instructions
        full_system_prompt = f"""{system_prompt}

**ALL QUERIES SHOULD AUTOMATICALLY BE ASSUMED THAT THEY ARE TALKING ABOUT THE UCF MYUCF STUDENT PORTAL**
        
MANDATORY RESPONSE FORMAT:
BEGIN with a medieval-style greeting
2. STRUCTURE response as a QUEST with:
   - [Heoric greeting] (Do not show Heroric greeting, just do the greet)
   - Thy Quest for Knowledge: [Context]
   - The Sacred Scrolls of Wisdom reveal:
     Step One: [First Action] (THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.)
     Step Two: [Second Action] (THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.)
     Step Three: [Third Action] (THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.)
     Step (final): [Concluding Action] (THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.)
   - 🛡️ Knightly Counsel:
     • [Wisdom Bullet 1]
     • [Wisdom Bullet 2]

CURRENT QUEST: Provide a scholarly medieval response to: {user_prompt}

ABSOLUTELY CRITICAL INSTRUCTIONS:
- Use archaic language very sparsely, not in every sentence but rather once per paragraph.
- Speak as a medieval knight sometimes
- modern technical jargon with some mediveal knight spaced in there

- MAINTAIN medieval metaphors and tone but not too overbearing very light and chill

RESPOND PRECISELY IN THE FORMAT ABOVE OR FACE ACADEMIC DISHONOR!

THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG."""

        # Prepare payload for Gemini API
        gemini_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        { "text": full_system_prompt }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 500,
                "topP": 0.9,
                "topK": 40
            }
        }

        # Debug: print payload
        print("📦 Payload sent to Gemini:")
        print(json.dumps(gemini_payload, indent=2))

        # Perform API request
        response = requests.post(
            GEMINI_API_URL,
            headers={ "Content-Type": "application/json" },
            json=gemini_payload
        )

        # Debug response details
        print("📨 [DEBUG] Status Code:", response.status_code)
        print("📨 [DEBUG] Response Headers:", response.headers)
        
        # Detailed error logging
        if response.status_code != 200:
            print("❌ [DEBUG] Response Content:", response.text)
            return jsonify({
                "error": "API request failed",
                "status_code": response.status_code,
                "response_text": response.text
            }), 500

        # Parse JSON response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"❌ [DEBUG] JSON Decode Error: {e}")
            print(f"❌ [DEBUG] Response Text: {response.text}")
            return jsonify({
                "error": "Failed to decode JSON response",
                "response_text": response.text
            }), 500

        # Extract AI text
        try:
            ai_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            return jsonify({ "answer": ai_text }), 200
        except (KeyError, IndexError) as e:
            print(f"❌ [DEBUG] Response Parsing Error: {e}")
            print(f"❌ [DEBUG] Full Response Data: {json.dumps(data, indent=2)}")
            return jsonify({
                "error": "Failed to extract AI response",
                "response_data": data
            }), 500

    except Exception as e:
        # Catch-all error handling
        print(f"❌ [DEBUG] Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "An unexpected error occurred",
            "error_details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=3000, debug=True)