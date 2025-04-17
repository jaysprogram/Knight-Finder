// popup.js

//Define the responseElement:
const responseElement = document.getElementById("responseText");

//Remember the current session
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {action: "RequestSave"}, (response) => {
    responseElement.innerText = response.message;
    if(responseElement.innerText == "") {
      responseElement.innerText = "Sir Guidewell awaits your instructions brave knight!";
    }
    console.log(response.message);
  });
});
  

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
    loadTopSearches();
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
  // Add event listeners to each button to reload the search
  const historyButtons = history.querySelectorAll(".history-item");

  historyButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const selectedSearch = historyQueue[index];
      // Set search bar value and submit the form
      searchBoxElement.value = selectedSearch;

      // Simulate going back to main page
      document.querySelectorAll(".page").forEach(p => p.classList.remove('active'));
      document.getElementById("mainPage").classList.add("active");

      // Manually trigger the search submit
      processSearchBox(new Event("submit"));
    });
  });
}

async function loadTopSearches() {
  console.log("test");
  // connect to the database
  try {
    const response = await fetch("http://localhost:3000/searches");
    const data = await response.json();
    
    // debugging
    console.log("Data: ", data);
    const listContainer = document.getElementById("topSearchesList");
    /*if (!listContainer) {
      console.warn("Element #topSearchesList not found.");
      return;
    }*/

    //clear our what was on the page
    listContainer.innerHTML = "";
    if(!data.searches||data.searches.length == 0){
      listContainer.innerHTML = "<li>No recent searches found.</li>";
      return;
    }
    else{
 // travers through every item in the database
    data.searches.forEach(search => {
      const item = document.createElement("li");
      item.innerHTML = `<button class="history-item">${search}</button>`;
      //item.textContent = search;
      listContainer.appendChild(item);
    });
    }
  } catch (err) {
    console.error("Failed to fetch top searches", err);
  }
  // Add event listeners to each button to reload the search
const topSearchButtons = document.querySelectorAll("#topSearchesList .history-item");

topSearchButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const selectedSearch = button.textContent;

    // Set search bar value
    searchBoxElement.value = selectedSearch;

    // Switch back to main page
    document.querySelectorAll(".page").forEach(p => p.classList.remove('active'));
    document.getElementById("mainPage").classList.add("active");

    // Manually trigger the search submit
    processSearchBox(new Event("submit"));
  });
});
}


let arrayOfStepStrings = [];

// snippet from pop.js

// A global array: each element is { role: "user"|"assistant", content: string }
let convohistory = [];

/**
 * Called when user submits the search prompt.
 */
function processSearchBox(e) {

  // prevent form refresh
  if (e.preventDefault) e.preventDefault();
  
  // Grab user text
  const searchRequest = document.getElementById("searchBar").value.trim();
  document.getElementById("searchBar").value = "";
  
  if (!searchRequest) {
    responseElement.innerText = "Please enter a question.";
    return;
  }

  // save information from the search box to the database
fetch("http://localhost:3000/searches", { // start request to backend
  method: "POST",
  headers: {
    "Content-Type": "application/json" // tells flask to expect a type json body
  },
  body: JSON.stringify({ search_term: searchRequest }) // turn the json body into a string and send it to search_term
})

// wait for server to reply for debugging
.then(response => response.json())
.then(data => {
  console.log("✅ Successfully saved to DB:", data);
})
.catch(err => {
  console.error("❌ Error saving to DB:", err);
});

  // 1. Insert user’s new question into convohistory
  convohistory.push({
    role: "user",
    content: searchRequest
  });

  // Loading text
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
  responseElement.innerText = knightPhrases[Math.floor(Math.random() * knightPhrases.length)];

  // 2. Send prompt + entire conversation to background script
  chrome.runtime.sendMessage(
    {
      action: "fetchGemini",
      prompt: searchRequest,
      history: convohistory,
    },
    (response) => {
      // 3. On success, response.result is Gemini's latest answer
      if (response?.result) {
        responseElement.innerText = response.result;

        //Save this result
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {action: "SetSave", message: response.result}, (response) => {
            if (response.status === "success") {
              console.log("Variable modified successfully");
            }
          });
        });
        
          
        // 4. Store assistant’s answer back into convohistory
        convohistory.push({
          role: "assistant",
          content: response.result
        });

          //Highlight them
          // popup.js
          if(response.result.match(/"([^"]+)"/g) != null) arrayOfStepStrings = response.result.match(/"([^"]+)"/g).map(element => element.replace(/"/g, '')).map(element => element.replace(/[.,]/g, ''));
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
    }
  );

  // Optionally store user text in local search history too
  saveHistory(searchRequest);
}
