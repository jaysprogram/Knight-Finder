// Function to stop the page from refreshing after every button pressed
function preventRefresh(e){
  // Checks to see if the method exists on the browser being used
  // e.preventDefault stops the page from refreshing after input
  if (e.preventDefault) e.preventDefault();
}
function processSearchBox(e){
  // Saving a duplicate the user enters and reset original to empty
  let searchRequest = searchBoxElement.value;
  searchBoxElement.value = "";

  // call preventRefresh
  preventRefresh(e);
}
// Creating a variable to take in the input of the user from the searchBox
let searchBoxForm = document.getElementById("searchBox");

// Gets element(html) from searchBar
let searchBoxElement = document.getElementById("searchBar");

// Runs the function processSearchBox
searchBoxForm.addEventListener("submit",processSearchBox);

