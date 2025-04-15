
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
  // Checks to see if the method exists on the browser being used
  // e.preventDefault stops the page from refreshing after input
  if (e.preventDefault) e.preventDefault();
}




async function saveHistory(searchRequest) {
  //Pull history first
  // History Queue is an aray of Strings with most recent searches
  let historyQueue = [];
  
  // Fetch data from chrome
  const data = await chrome.storage.sync.get("pastSearches");
  if(data == undefined || data.pastSearches == undefined){
    if(history != null) history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  } 
  else {
      // For loop populating array
    for(let i = 0; i < numHistorySearches; i++){
      // Checks to make sure object pastSearches has the property we are looking for
      if(Object.hasOwn(data.pastSearches, "history" + (i).toString())){
        historyQueue[i] = data.pastSearches["history" + (i).toString()];
      } 
    }
  }

  //Actually Save the History
  let counter = historyQueue.length;
  if(counter >= numHistorySearches){
    // shift everything down
    for(let i = 0; i < numHistorySearches - 1; i++){
      historyQueue[i] = historyQueue[i+1];
    }
    // Replace last element
    historyQueue[counter - 1] = searchRequest;
      
  } else {
    //Add another element to search history
    historyQueue[counter] = searchRequest;
  }

  //Store search queue inside of past searches
  let pastSearches = {};
  
  for(let i = 0; i < historyQueue.length; i++) {
    Object.defineProperty(pastSearches, "history" + (i).toString(), {
      value: historyQueue[i], writable: true, enumerable: true, configurable: true
    });
  }

  //Tell chrome to store the data in past searches
  chrome.storage.sync.set({pastSearches});
}

// Function called to display history
async function loadHistory() {
  
  // History Queue is an aray of Strings with most recent searches
  let historyQueue = [];
  
  // Fetch data from chrome
  const data = await chrome.storage.sync.get("pastSearches");
  if(data == undefined || data.pastSearches == undefined){
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  } else {
    // For loop populating array
    // We'll build up a list as a string
    let htmlStr = "<ol>";

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
}
 /*
  // Fetch data from Chrome
  const data = await chrome.storage.sync.get("pastSearches");
  if(data != undefined && data.pastSearches != undefined && "history1" in data.pastSearches) {
    const pastSearches = {};
    Object.assign(pastSearches, data.pastSearches);
    history.innerHTML = pastSearches["history1"];
  } else {
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  }
}
*/

let arrayOfStepStrings = [];

function processSearchBox(e){

  // call preventRefresh
  preventRefresh(e);
  // Saving a duplicate the user enters and reset original to empty
  let searchRequest = searchBoxElement.value;
  searchBoxElement.value = "";



  // process search request
  const responseElement = document.getElementById("responseText");

  if (!searchRequest) {
      responseElement.innerText = "Please enter a question.";
      return;
  }

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

  chrome.runtime.sendMessage({ action: "fetchGemini", prompt: searchRequest }, (response) => {
      if (response?.result) {
          responseElement.innerText = response.result;

          //Highlight the stuff the ai told us to.
          //Pull the list of instructions
          //set arrayOfStepStrings here
          

          //Highlight them
          // popup.js
          arrayOfStepStrings = response.result.match(/"([^"]+)"/g).map(element => element.replace(/"/g, ''));
          let newValue = arrayOfStepStrings; // The new value you want to set
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, {action: "modifyVariable", newValue: newValue}, (response) => {
                  if (response.status === "success") {
                      console.log("Variable modified successfully");
                  }
              });
          });
      } else {
          responseElement.innerText = "Error fetching response.";
      }
  });
  
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
  saveHistory(searchRequest);

  
}


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
    }
  }




