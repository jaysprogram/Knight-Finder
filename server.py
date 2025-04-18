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

#Import the google search tool
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch


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
            return jsonify({ "error": "No search_term provided" }), 400

        keyword = search_term.strip().lower()

        print("🔍 Incoming search:", search_term)
        print("🔍 Normalized keyword:", keyword)

        # Check if the keyword already exists
        cursor.execute("SELECT count FROM searches WHERE search_term = %s", (keyword,))
        existing = cursor.fetchone()

        print("🧠 Existing entry:", existing)

        if existing:
            print("↪️ Updating count...")
            cursor.execute("UPDATE searches SET count = count + 1 WHERE search_term = %s", (keyword,))
        else:
            print("➕ Inserting new keyword...")
            cursor.execute("INSERT INTO searches (search_term, count) VALUES (%s, %s)", (keyword, 1))

        db.commit()
        print("✅ Successfully committed to DB")

        return jsonify({ "success": True }), 200

    except Exception as e:
        print("❌ Error saving search term:", e)
        return jsonify({ "error": "Database error", "details": str(e) }), 500
# tell flask to start function when a get request is given i.e button click
@app.route('/searches', methods=['GET'])
def get_search_terms():

    #get last 10 items
    cursor.execute("SELECT search_term FROM searches ORDER BY count DESC LIMIT 7")
    
    # take the result and fetch it all
    results = cursor.fetchall()
    

    search_terms = [row[0] for row in results]
    return jsonify({ "searches": search_terms })    

# 2) Configure your API key and initialize the client
API_KEY = "AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg"
client = genai.Client(api_key=API_KEY)

#Define the google search tool
google_search_tool = Tool(
    google_search = GoogleSearch()
)

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
     Step (final): [etc] (THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.)
   - 🛡️ Knightly Counsel:
     • [Wisdom Bullet 1]
     • [Wisdom Bullet 2]

YOU DO NOT HAVE TO PROVIDE THREE STEPS OR EVEN STEPS EXPLICITLY, BUT IF THE STUDENT IS NAVIGATING MYUCF, PLEASE GIVE THEM THIS STEP BASED FORMAT.
     
CURRENT QUEST: Provide a scholarly medieval response

ABSOLUTELY CRITICAL INSTRUCTIONS:
- Use archaic language very sparsely, not in every sentence but rather once per paragraph.
- Speak as a medieval knight sometimes
- modern technical jargon with some mediveal knight spaced in there

- MAINTAIN medieval metaphors and tone but not too overbearing very light and chill

RESPOND PRECISELY IN THE FORMAT ABOVE OR FACE ACADEMIC DISHONOR!

THE STUDENTS YOU ARE DIRECTING HAVE AN INCREDIBLY LOW ATTENTION SPAN. YOU NEED TO MAKE SURE YOUR MESSAGES PER DIRECTION ARE VERY SHORT AND ARE ONLY ONE SETENCE LONG.

TO HELP YOU UNDERSTAND WHAT ARE THE SPECIFIC NAMES OF THE OPTIONS STUDENTS HAVE TO CLICK ON THE MYUCF SITE, I HAVE PROVIDED THE HIERARCHY BELOW. 
SOME SECTIONS ARE UNDER OTHERS, SO YOU WILL NEED TO SPECIFY A SECTION FIRST TO CLICK ON SO THAT THE STUDENT YOU ARE GUIDING CAN ACCESS AN ELEMENT UNDER IT! 
YOU MUST START WITH THE PHRASE ON THE OUTSIDE FIRST, SO FOR EXAMPLE IF A STUDENT WANTS TO ADD CLASSES, YOU WOULD PROVIDE THEM THE STEPS "Student Self Service" -> "Student Records" -> "Enrollment" -> "Add Classes"
IN THE CASE THAT SOMEONE ASKS ANYTHING THAT HAS STUDENT RECORDS, YOU MUST MENTION IT. DONT SKIP IT.

BECAUSE OF THIS HIERARCHY, YOU MUST HAVE STEP ONE INCLUDE ONE OF THESE PHRASES IF THEIR QUESTION IS ABOUT NAVIGATION ON MYUCF:
Academic Resources
Student Self Service
My Content
Reporting Tools
PeopleTools
Change my NID Password
UCF Email
Webcourses@UCF
UCF Home Page
UCF COM Home Page
My Preferences
CHOOSE THE CORRECT PHRASE TO ANSWER THE STUDENT'S QUESTION. MAKE SURE TO PRIORITIZE THE LIST OVER GOOGLE
YOU MUST SURROUND THESE PHRASES WITH QUOTATIONS LIKE "Specific Given Phrase" SO THAT A SCRIPT READING YOUR TEXT WORKS PROPERLY!
HERE ARE THE FOLLOWING SPECIFIC BUTTON PHRASES YOU MUST USE TO CORRECTLY NAVIGATE A USER THROUGH THE WEBSITE:
Academic Resources
    Learning Online
    GPA Estimator
Student Self Service
    Personal Information
        Names
        Ethnicity
        Addresses
        Email Addresses
        Phone Numbers
        Emergency Contacts
        FERPA/Directory Restrictions
        UCFID Info
    Holds & To Dos
        Holds
        To Dos
    Student Records
        Course Catalog & Schedule
            Class Search/Browse Catalog
        Bulletin Boards
            Enrollment
        Academic History
            myKnightAudit
            View My Grades
            Apply for Grade Forgiveness
            Grade Forgiveness Status
            Apply for Graduation
            Enrollment Verification
            Transfer Credit Report
            Academic Information
            View My Advisors
        Enrollment
            View My Class Schedule
            Add Classes
            Drop/Withdraw Classes
            Swap Classes
            View My Weekly Schedule
            View Enrollment Appointment
            View My Class Schedule
    Graduate Students
        Student Center
        Graduate Bulletin
        Graduate Catalog
        Graduate Student Association
        Graduate Studies Website
        Request Graduate Information
        Research Week
    International Students
        Student Center
        Bulletin Board
        I-20 Status
        International Services Website
        Sprintax Link
        Sprintax Instructions
    Undergraduate Admissions
        Student Center
        Admissions Home Page
        Application Document Status
        Visiting the Campus
        Immunization Information
        Reactivation Form
        Orientation
        Scholarships
    Student Accounts
        Tuition Payment Plan
        Student Center
        View Your Account
        Fee Invoice
        Direct Deposit
        Student Services Website
        1098-T Tax Management
    Financial Aid
        View Financial Aid
        Student Center
    Scholarship Application
        Home Page
    Housing
        Housing Portal
        Missing Person Contact
        Information
    Dining Services
        Dining Memberships
        Dining Locations & Menus
        Dining Catering
    User Settings
        Enrollment
        Student Center
        myKnightSTAR
    Placement Test Self-Enrollment
    Student Center
    myKnightSTAR
My Content
Reporting Tools
PeopleTools
Change my NID Password
UCF Email
Webcourses@UCF
UCF Home Page
UCF COM Home Page
My Preferences
"""


# The system instructions are added via the configuration below.
chat = client.chats.create(
    model="gemini-2.0-flash",
    config=types.GenerateContentConfig(tools=[google_search_tool], system_instruction=SYSTEM_PROMPT)
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
