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
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
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
    return;
  }

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
}

function processSearchBox(e){
  preventRefresh(e);
  let searchRequest = searchBoxElement.value;
  searchBoxElement.value = "";
  const responseElement = document.getElementById("responseText");
  if (!searchRequest) {
      responseElement.innerText = "Please enter a question.";
      return;
  }
  responseElement.innerText = "Loading...";
  chrome.runtime.sendMessage({ action: "fetchGemini", prompt: searchRequest }, (response) => {
      if (response?.result) {
          responseElement.innerText = response.result;
      } else {
          responseElement.innerText = "Error fetching response.";
      }
  });
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

  } catch (err) {
    console.error(err);
    responseEl.textContent = "Something went wrong!";
  }
});
