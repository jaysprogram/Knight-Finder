chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchGemini") {
      fetchGeminiResponse(message.prompt, message.history)
        .then(response => sendResponse({ result: response }))
        .catch(error => sendResponse({ error: error.message }));
      return true; // keep the port open for async
    }
  });
  
  async function fetchGeminiResponse(prompt, history) {
    const serverUrl = "http://127.0.0.1:3000/api/gemini"; 
    try {
      const response = await fetch(serverUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response from Gemini:", data);
  
      return data.answer; // The AI-generated text
    } catch (error) {
      console.error("Error fetching gemini response:", error);
      return "Error occurred.";
    }
  }