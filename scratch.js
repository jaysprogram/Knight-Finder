


const response = await fetch("http://localhost:3000/searches"); // Adjust port if needed
    const data = await response.json();

    const listContainer = document.getElementById("historyList");
    listContainer.innerHTML = "";

    data.searches.forEach(search => {
      const item = document.createElement("li");
      item.textContent = search;
      listContainer.appendChild(item);
    });
  } catch (err) {
    console.error("❌ Failed to fetch search history:", err);
  }
