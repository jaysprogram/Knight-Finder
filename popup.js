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

function saveHistory(searchRequest) {
  let pastSearches = {};
  pastSearches.history1 = searchRequest;

  chrome.storage.sync.set({pastSearches});
}

async function loadHistory() {
  const data = await chrome.storage.sync.get("pastSearches");
  if(data != undefined && data.pastSearches != undefined && "history1" in data.pastSearches) {
    const pastSearches = {};
    Object.assign(pastSearches, data.pastSearches);
    history.innerHTML = pastSearches["history1"];
  } else {
    history.innerHTML = "It looks like you don't have any history yet. Try searching to see your past searches here!";
  }
}

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



//Call the asynchronous function to set the history
let history = document.getElementById("history");
loadHistory();

