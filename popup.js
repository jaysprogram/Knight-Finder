// Function to stop the page from refreshing after every button pressed
function preventRefresh(e){
  // Checks to see if the method exists on the browser being used
  // e.preventDefault stops the page from refreshing after input
  if (e.preventDefault) e.preventDefault();
}

  /*
  return new Promise((resolve, reject) => {

  })

  try {

  }
  catch(error) {
    console.error(error);
  }
  
  // In-page cache of the user's options
  const options = {};
  const optionsForm = document.getElementById("optionsForm");
  
  // Immediately persist options changes
  optionsForm.debug.addEventListener("change", (event) => {
    options.debug = event.target.checked;
    chrome.storage.sync.set({ options });
  });
  
  // Initialize the form with the user's option settings
  const data = await chrome.storage.sync.get("options");
  Object.assign(options, data.options);
  optionsForm.debug.checked = Boolean(options.debug);

  */

async function saveHistory(searchRequest) {
  //Pull history first
  // History Queue is an aray of Strings with most recent searches
  let historyQueue = [];
  
  // Fetch data from chrome
  const data = await chrome.storage.sync.get("pastSearches");
  if(data == undefined || data.pastSearches == undefined){
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  } else {
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
  for(let i = numHistorySearches - 1; i >= 0; i--){
    // Checks to make sure object pastSearches has the property we are looking for
    if(Object.hasOwn(data.pastSearches, "history" + (i).toString())){
      historyQueue[i] = data.pastSearches["history" + (i).toString()];

      //This will be removed later
      history.innerHTML += "\n" + (i).toString() + ":- " + historyQueue[i];
    } 
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

function processSearchBox(e){
  // Saving a duplicate the user enters and reset original to empty
  let searchRequest = searchBoxElement.value;
  searchBoxElement.value = "";

  //Save the history
  saveHistory(searchRequest);

  // call preventRefresh
  preventRefresh(e);
}
// Creating a variable to take in the input of the user from the searchBox
let searchBoxForm = document.getElementById("searchBox");

// Gets element(html) from searchBar
let searchBoxElement = document.getElementById("searchBar");

// Runs the function processSearchBox
searchBoxForm.addEventListener("submit",processSearchBox);

// Starting Backend for History
var numHistorySearches = 4;



//Call the asynchronous function to set the history
let history = document.getElementById("history");
loadHistory();

