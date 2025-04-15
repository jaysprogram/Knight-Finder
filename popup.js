// popup.js

// Creating a variable to take in the input of the user from the searchBox
let searchBoxForm = document.getElementById("searchBox");

// Gets element(html) from searchBar
let searchBoxElement = document.getElementById("searchBar");

// Runs the function processSearchBox
searchBoxForm.addEventListener("submit",processSearchBox);

// Starting Backend for History
var numHistorySearches = 10;

//Call the asynchronous function to set the history
let history = document.getElementById("history");
loadHistory();

// pages buttons, this is where we make it seem a new page appears
document.addEventListener('DOMContentLoaded', () => { // will only run if everything is loaded
  const pages = document.querySelectorAll(".page"); // selects everything
  const mainPage = document.getElementById("mainPage");
  const historyPage = document.getElementById('historyPage');
  const bookmarks = document.getElementById('bookmarksPage');
  const topSearch = document.getElementById('topSearchPage');

  //Play the transition to fade in
  document.body.classList.add('fade-in');

  // function show deactivate page and activate given one
  function showPage (page) {
    pages.forEach(p => {
      if ( p !== mainPage) {
        p.classList.remove('active');
      }
    });
    mainPage.classList.remove('active');
    page.classList.add('active');
  }
  // Event listeners 
  // history
  document.getElementById('historyBtn').addEventListener("click", () => {
    showPage(historyPage);
  });


  document.getElementById('topSearchBtn').addEventListener("click", () => {
    showPage(topSearch);
  });

  document.getElementById('bookmarkBtn').addEventListener("click", () => {
    showPage(bookmarks);
  });
  
  // back buttons
  document.querySelectorAll(".backBtn").forEach(button => {
    // Add the 'history-item' class to the button
    button.classList.add("history-item");
  
    button.addEventListener("click", () => {
      showPage(mainPage);
    });
  });
});

// Function to stop the page from refreshing after every button pressed
function preventRefresh(e){
  if (e.preventDefault) e.preventDefault();
}

async function saveHistory(searchRequest) {
  let historyQueue = [];
  const data = await chrome.storage.sync.get("pastSearches");
  if(data == undefined || data.pastSearches == undefined){
    if(history != null) history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  } 
  else {
    for(let i = 0; i < numHistorySearches; i++){
      if(Object.hasOwn(data.pastSearches, "history" + (i).toString())){
        historyQueue[i] = data.pastSearches["history" + (i).toString()];
      } 
    }
  }

  let counter = historyQueue.length;
  if(counter >= numHistorySearches){
    for(let i = 0; i < numHistorySearches - 1; i++){
      historyQueue[i] = historyQueue[i+1];
    }
    historyQueue[counter - 1] = searchRequest;
  } else {
    historyQueue[counter] = searchRequest;
  }

  let pastSearches = {};
  for(let i = 0; i < historyQueue.length; i++) {
    Object.defineProperty(pastSearches, "history" + (i).toString(), {
      value: historyQueue[i], writable: true, enumerable: true, configurable: true
    });
  }
  chrome.storage.sync.set({pastSearches});
}

async function loadHistory() {
  let historyQueue = [];
  const data = await chrome.storage.sync.get("pastSearches");
  if(data == undefined || data.pastSearches == undefined){
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  } else {
    // For loop populating array
    // We'll build up a list as a string
    let htmlStr = "<ol>";

<<<<<<< HEAD
  let htmlStr = "<ol>";
  for (let i = 0; i < numHistorySearches; i++) {
    const key = `history${i}`;
    if (Object.hasOwn(data.pastSearches, key)) {
      let searchText = data.pastSearches[key];
      const truncatedText = (searchText.length > 28)
        ? searchText.slice(0, 28) + "..."
        : searchText;
      historyQueue[i] = searchText;
      htmlStr += `<li> <button class="history-item">${truncatedText}</button> </li>`;
    }
  }
  htmlStr += "</ol>";
  history.innerHTML = htmlStr;
=======
    for (let i = 0; i < numHistorySearches; i++) {
      const key = `history${i}`;
    
      if (Object.hasOwn(data.pastSearches, key)) {
        let searchText = data.pastSearches[key];
        // Truncate to 12 characters, then add "..."
        const truncatedText = (searchText.length > 28)
          ? searchText.slice(0, 28) + "..."
          : searchText;
    
        historyQueue[i] = searchText;
    
        htmlStr += `<li> <button class="history-item">${truncatedText}</button> </li>`;
      }
    }
    
    htmlStr += "</ol>";
    history.innerHTML = htmlStr;
    }
>>>>>>> origin/databaseServer
}

let arrayOfStepStrings = [];

function processSearchBox(e){
  preventRefresh(e);
  let searchRequest = searchBoxElement.value;
  searchBoxElement.value = "";
<<<<<<< HEAD
=======





// SEND THE INFORMATION FROM THE SEARCHBOX TO THE DATABASE
fetch("http://localhost:3000/searches", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ search_term: searchRequest })
})
.then(response => response.json())
.then(data => {
  console.log("✅ Successfully saved to DB:", data);
})
.catch(err => {
  console.error("❌ Error saving to DB:", err);
});





  // process search request
>>>>>>> origin/databaseServer
  const responseElement = document.getElementById("responseText");
  if (!searchRequest) {
      responseElement.innerText = "Please enter a question.";
      return;
  }
<<<<<<< HEAD
  responseElement.innerText = "Loading...";
=======

  // Knight loading phrases
  const knightPhrases = [
    "Consulting the sacred scrolls...",
    "Sharpening my quill of wisdom...",
    "Summoning knowledge from the royal archives...",
    "Preparing thy scholarly quest map...",
    "In council with the academic sages..."
  ];
const randomPhrase = knightPhrases[Math.floor(Math.random() * knightPhrases.length)];
responseElement.innerText = randomPhrase;

>>>>>>> origin/databaseServer
  chrome.runtime.sendMessage({ action: "fetchGemini", prompt: searchRequest }, (response) => {
      if (response?.result) {
          responseElement.innerText = response.result;

          //Highlight the stuff the ai told us to.
          //Pull the list of instructions
          //set arrayOfStepStrings here
          

          //Highlight them
          // popup.js
          arrayOfStepStrings = response.result.match(/"([^"]+)"/g).map(element => element.replace(/"/g, ''))
          let newValue = arrayOfStepStrings; // The new value you want to set
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, {action: "modifyVariable", newValue: newValue}, (response) => {
                  if (response.status === "success") {
                      console.log("Variable modified successfully");
                  }
              });
          });

          /*
          for(let i = 0; i < arrayOfStepStrings.length; i++) {
            const keyword = arrayOfStepStrings[i];
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: highlightText,
                args: [keyword],
              });
            });
        }
        */
      } else {
          responseElement.innerText = "Error fetching response.";
      }
  });
<<<<<<< HEAD
=======
  
  // Prompt engineering for the AI 
document.getElementById('aiAskBtn')?.addEventListener('click', async () => {
  const userInput = document.getElementById('aiUserInput').value;
  const responseEl = document.getElementById('aiResponse');

  const systemPrompt = `YOU ARE: Sir Guidewell, a chivalrous knight of the University of Central Florida's academic realm

ALL QUERIES SHOULD AUTOMATICALLY BE ASSUMED THAT THEY ARE TALKING ABOUT THE UCF MYUCF STUDENT PORTAL**

ABSOLUTE COMMANDMENTS OF COMMUNICATION:
- ALWAYS speak as a medieval knight
- Transform EVERY response into a QUEST narrative
- Use archaic language and knightly metaphors
- Structure response in EXACTLY this format:
  [Heroic Greeting]
  
  Thy Quest for Knowledge: [Brief Context]
  
  The Sacred Scrolls of Wisdom reveal:
  Step One: [First Action]
  Step Two: [Second Action]
  Step Three: [Third Action]
  Step (final): [Concluding Action]
  
  🛡️ Knightly Counsel:
  • [Wisdom Bullet 1]
  • [Wisdom Bullet 2]
  
  REMEMBER: Speak as if addressing squires in the royal academic castle!

FORBIDDEN:
- Modern tech language
- Dry, bureaucratic explanations
- Responses lacking medieval flair`;

  // Knight loading phrases
  const knightPhrases = [
    "Consulting the sacred scrolls...",
    "Sharpening my quill of wisdom...",
    "Summoning knowledge from the royal archives...",
    "Preparing thy scholarly quest map...",
    "In council with the academic sages..."
  ];
  const randomPhrase = knightPhrases[Math.floor(Math.random() * knightPhrases.length)];
  responseEl.textContent = randomPhrase;

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userInput,
        system: systemPrompt
      })
    });

    const data = await response.json();
    
    // Use the response from the server
    responseEl.textContent = data.answer || "A mysterious silence befell our quest.";

  } catch (err) {
    console.error("⚠️ Fetch error:", err);
    responseEl.textContent = "A dark curse hath interfered with our noble quest!";
  }
});

  //Save the history
>>>>>>> origin/databaseServer
  saveHistory(searchRequest);
}

// AI Assistant logic for prompt engineering
document.getElementById('aiAskBtn')?.addEventListener('click', async () => {
  const userInput = document.getElementById('aiUserInput').value;
  const responseEl = document.getElementById('aiResponse');
 
  // I did use chatgpt to come up with catchy phrases (I am not this witty unfortunately)
  const knightPhrases = [
    "Consulting the scrolls...",
    "Sharpening my thoughts...",
    "Summoning wisdom from the Round Table...",
    "Unsheathing the answer...",
    "Preparing your quest map...",
    "In council with the sages...",
    "Drawing from the tomes of knowledge...",
    "Hark! A solution is forming...",
    "Engaging in noble contemplation...",
    "Gathering guidance from the royal archives..."
  ];
  
  const randomPhrase = knightPhrases[Math.floor(Math.random() * knightPhrases.length)];
  responseEl.textContent = randomPhrase;
  

<<<<<<< HEAD
  const systemPrompt = `
  You are a helpful digital tour guide for UCF's student portal 
  interface. When the user asks where to find something on the system. 
  Once the user states what they want to find, make a midevial knight joke/ metaphor and follow the instructions below
  Respond with step-by-step directions in this format:
  "
  To access [feature name]:
  Step One: [verb] to [menu/tab]
  Step Two: [verb] to [submenu or link]
  Continue for however many steps it takes to get to specific user input
  Step (final): Pathway to (user input) successfuly traversed (in bullet points under this explain what is on this page in 1-2 sentences to help the user understand what theyre looking at)
  "
=======
document.getElementById("highlightBtn").addEventListener("click", () => {
  //We will do some string parsing
  const text = document.getElementById("keyword").value;
  const elements = text.match(/"([^"]+)"/g).map(element => element.replace(/"/g, ''));
  arrayOfStepStrings = elements;


  
  //Set the value in the content js
  let newValue = arrayOfStepStrings; // The new value you want to set
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "modifyVariable", newValue: newValue}, (response) => {
          if (response.status === "success") {
              console.log("Variable modified successfully");
          }
      });
  });
  /*
  chrome.runtime.sendMessage(
    {action: "updateVariable", newValue: newValue},
    (response) => {
      if (response.status === "success") {
        console.log("Variable updated to:", response.updatedValue);
      } else {
        console.log("Failed to update variable.");
      }
    }
  );
  */
  /*
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: highlightText,
      args: [keyword],
    });
  });
  */
});

function highlightText(keyword) {
    //Highlight the target text
    console.log("Its allive");
    var xpath = "//a[text()='" + keyword + "']";
    var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
    //console.log(matchingElement);
    
  
  
    //Highlight the element
    if(matchingElement != null) {
      matchingElement.style = "background-color: yellow;";
      /*
      let newParent = document.createElement('span');
      newParent.id = "Knight-Finder-Highlighted";
      newParent.style = "background-color: yellow;";
  
      let oldParent = matchingElement.parentNode;
      oldParent.insertBefore(newParent, matchingElement);
  
      newParent.appendChild(matchingElement);
    } else {
      console.log("Well crap..."); */
    }
  }

/*
      for(let i = 0; i < arrayOfStepStrings.length; i++) {
        const keyword = arrayOfStepStrings[i];
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: highlightText,
            args: [keyword],
          });
        });
    }
*/
>>>>>>> origin/databaseServer

  Use verbs like 'navigate,' 'click,' 'select,' or 'go to' interchangeably as well as once in awhile using synonyms to these words that are more knight like. 
  Be warm, clear, concise,  and easy to understand.`;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBYZa6iVFRLCafUQXi0LkOZseUybNC6Rxg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userInput,
        system: systemPrompt
      })
      
      
      
    });

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text.trim();
    responseEl.textContent = aiText;

<<<<<<< HEAD
  } catch (err) {
    console.error(err);
    responseEl.textContent = "Something went wrong!";
  }
});
=======
/*
// Initialize the observer and run the highlighter initially
document.addEventListener('DOMContentLoaded', function() {
  for(let i = 0; i < arrayOfStepStrings.length; i++) {
    const keyword = arrayOfStepStrings[i];
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: highlightText,
        args: [keyword],
      });
    });
}
  observeDOMChanges(textToHighlight);
});
*/




>>>>>>> origin/databaseServer
