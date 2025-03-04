chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchGemini") {
      fetchGeminiResponse(message.prompt)
          .then(response => sendResponse({ result: response }))
          .catch(error => sendResponse({ error: error.message }));
      return true; // Required to keep sendResponse() async
  }
});

console.log("Background script loaded!");

async function fetchGeminiResponse(prompt) {
  const serverUrl = "http://127.0.0.1:3000/api/gemini"; // Flask server URL

    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({prompt}) 
        });
        if(!response.ok){
          throw new Error(`HTTP error. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response from Gemini:', data);

        //Extract the AI-generated text
        return data.answer;
        
    } catch (error) {
        console.error('Error fetching gemini response:', error);
        return 'Error occured.';
    }

}
