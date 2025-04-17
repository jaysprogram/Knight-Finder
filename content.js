function getArrayFromSessionStorage() {
  const arrayString = sessionStorage.getItem('knightFinderSessionStorage');
  return arrayString ? JSON.parse(arrayString) : [];
}

let arrayOfStepStrings = getArrayFromSessionStorage();

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "modifyVariable") {
    // Modify your variable here
    arrayOfStepStrings = request.newValue;
    console.log("Variable modified to:", arrayOfStepStrings);
    sessionStorage.setItem('knightFinderSessionStorage', JSON.stringify(arrayOfStepStrings));
    sendResponse({status: "success"});
  }
});



function highlightText(keyword) {
  //Highlight the target text
  var xpath = "//a[contains(text(), '>" + keyword + "<')]";
  var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  //console.log(matchingElement);
  
  //Highlight the element
  if(matchingElement != null) {
    console.log("jlkj;j;");
    matchingElement.style = "background-color: yellow;";
  }
}

function recurringHighlight() {
  //Remove highlighting
  const xpathH = "//*[@style[contains(., 'background-color: yellow;')]]";
  const result = document.evaluate(xpathH, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < result.snapshotLength; i++) {
    result.snapshotItem(i).style = ""; 
  }

  //Highlight the target text
  for(let i = 0; i < arrayOfStepStrings.length; i++) {
    //console.log(arrayOfStepStrings[i]);
    const keyword = arrayOfStepStrings[i];
    //Highlight the target text
    var xpath = "//a[contains(text(), '" + keyword + "')]";
    var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    //console.log(document);
  
    //Highlight the element
    if(matchingElement != null) {
      //console.log("jlkj;j;");
      matchingElement.style.backgroundColor = "yellow";
    }
  }
}


//Set Up the content array, then set the highlighting to be called on an interval
//Set up the array by loading in session content
//This will ensure if they are already searching, that it will stay loaded
//if(arrayOfStepStrings == []) arrayOfStepStrings = getArrayFromSessionStorage();

console.log(arrayOfStepStrings);
//Set up the highlighting to be called on an interval
setInterval(recurringHighlight, 200);
  

console.log("Content loaded!");

