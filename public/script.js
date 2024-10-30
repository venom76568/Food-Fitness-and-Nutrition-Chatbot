async function searchRecipe(newChat = false) {
  const query = document.getElementById("searchBox").value;

  const response = await fetch("/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, newChat }),
  });

  const data = await response.json();
  document.getElementById("response").innerText = data.answer;
}

// Function to handle clicks on example questions
function handleExampleClick(exampleQuery) {
  document.getElementById("searchBox").value = exampleQuery;
  searchRecipe(); // Trigger the search with the example query
}

// Attach the functions to buttons
document
  .getElementById("searchButton")
  .addEventListener("click", () => searchRecipe());
document.getElementById("newChatButton").addEventListener("click", () => {
  document.getElementById("searchBox").value = "";
  document.getElementById("response").innerText = "New chat started!";
  searchRecipe(true); // Pass true to indicate starting a new chat
});

document
  .getElementById("searchBox")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      searchRecipe(); // Trigger search when Enter is pressed
      event.preventDefault(); // Prevent the default form submission
    }
  });
