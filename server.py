import os
from flask import Flask, jsonify, request
import google.generativeai as genai
import requests
from flask_cors import CORS

# 1) Install and import the google.genai SDK
#    pip install google-genai
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

#database
import mysql.connector #load sql library

# open connection to mysql database
db = mysql.connector.connect(
host="localhost",
    user="root",
    password="Turkey37!",
    database="knight_finder_database"
        )

cursor = db.cursor() # create a cursor to talk to the database


# set up flask route
@app.route('/searches', methods=['POST'])
def save_search_term():
    try:
        data = request.get_json()
        search_term = data.get('search_term')

        if not search_term:
            return jsonify({ "❌ error": "No search_term provided" }), 400

        query = "INSERT INTO searches (search_term) VALUES (%s)"
        cursor.execute(query, (search_term,))
        db.commit()

        return jsonify({ "success": True, "insertedId": cursor.lastrowid }), 200

    except Exception as e:
        print("❌ Error saving search term:", e)
        return jsonify({ "error": "Database error", "details": str(e) }), 500

# 2) Configure your API key and initialize the client
API_KEY = "AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg"
client = genai.Client(api_key=API_KEY)

# 3) Define your comprehensive system prompt text.
SYSTEM_PROMPT = f"""

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

CURRENT QUEST: Provide a scholarly medieval response

ABSOLUTELY CRITICAL INSTRUCTIONS:
- Use archaic language very sparsely, not in every sentence but rather once per paragraph.
- Speak as a medieval knight sometimes
- modern technical jargon with some mediveal knight spaced in there

- MAINTAIN medieval metaphors and tone but not too overbearing very light and chill

RESPOND PRECISELY IN THE FORMAT ABOVE OR FACE ACADEMIC DISHONOR!

THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG."""


#    The system instructions are added via the configuration below.
chat = client.chats.create(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT)
)

@app.route("/api/gemini", methods=["POST"])
def chat_with_gemini():
    """
    This endpoint sends a user's new prompt to the single persistent chat,
    then returns the assistant's latest response.
    """
    try:
        data = request.get_json(force=True)
        user_prompt = data.get("prompt", "").strip()

        # If no prompt was provided, bail out.
        if not user_prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # Send user's message to the existing chat.
        response = chat.send_message(user_prompt)

        # Extract the assistant's reply.
        ai_answer = response.text

        # Return the assistant's response.
        return jsonify({"answer": ai_answer}), 200

    except Exception as e:
        print(f"❌ [ERROR] {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/gemini/history", methods=["GET"])
def get_chat_history():
    """
    Optional endpoint to view the entire chat so far.
    """
    history = chat.get_history()  # returns a list of messages
    # Each message has a .role (string) and a .parts list (each part has .text)
    conversation = []
    for message in history:
        # role: "user" or "model" (the assistant)
        msg_role = message.role
        # Each message can have multiple parts, but typically there's just one
        parts_text = [p.text for p in message.parts]
        conversation.append({
            "role": msg_role,
            "parts": parts_text
        })

    return jsonify({"history": conversation}), 200

if __name__ == "__main__":
    app.run(port=3000, debug=True)

#Database begins
#import mysql.connector

#Connect to the mySQL database
#database = mysql.connector.connect(
    #host="localhost",
    #user="root",
    #password="Turkey37!",
    #database="knight_finder_database"
        #)

#cursor = database.cursor()
#@app.route('/api/save-data', methods=['POST'])
#def save_user_data():
  #  try:
   #     data = request.get_json()
    #   search = data.get('searchBox')

     #   query = "INSERT INTO users (search) VALUES (%s)"
      #  cursor.execute(query, (search))
       # db.commit()

        #return jsonify({ "📦 message": "User data saved successfully" }), 200

    #except Exception as e:
     #   print("❌ Error saving data:", e)
      #  return jsonify({ "error": str(e) }), 500
