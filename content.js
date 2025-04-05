let arrayOfStepStrings = [];

// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "modifyVariable") {
      // Modify your variable here
      arrayOfStepStrings = request.newValue;
      console.log("Variable modified to:", arrayOfStepStrings);
      sendResponse({status: "success"});
  }
});



function highlightText(keyword) {
    //Highlight the target text
    keyword.replace(/[.,]/g, '');
    keyword.replace(/s$/, '');

    //words = keyword.split(' ');

    /*
    for(let i = 0; i < words.length; i++) {
      var xpath = "//a[contains(text(), '" + words[i] + "')]";
      var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

      if(matchingElement != null) break;
    }*/

    var xpath = "//a[contains(text(), '" + keyword + "')]";
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


setInterval(thing, 200);

  function thing() {
    //Remove highlighting
    const xpathH = "//*[@style[contains(., 'background-color: yellow;')]]";
    const result = document.evaluate(xpathH, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    //Highlight the target text
    for (let i = 0; i < result.snapshotLength; i++) {
        result.snapshotItem(i).style = ""; 
    }
    for(let i = 0; i < arrayOfStepStrings.length; i++) {
      const keyword = arrayOfStepStrings[i];
      highlightText(keyword);
    }

  }

/*
  document.addEventListener('click', function() {
    console.log("Say what");
    setTimeout(function() {
      for(let i = 0; i < arrayOfStepStrings.length; i++) {
        const keyword = arrayOfStepStrings[i];
        highlightText(keyword);
    }
    }, 800);

}, true);

*/


console.log("Content loaded!");

