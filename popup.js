
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
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
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
    return;
  }

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

  responseElement.innerText = "Loading...";

  chrome.runtime.sendMessage({ action: "fetchGemini", prompt: searchRequest }, (response) => {
      if (response?.result) {
          responseElement.innerText = response.result;
      } else {
          responseElement.innerText = "Error fetching response.";
      }
  });
  

  //Save the history
  saveHistory(searchRequest);

  
}










