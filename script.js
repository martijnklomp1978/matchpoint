const backendUrl = "https://matchpoint-vert.vercel.app"; // Vervang met je backend-URL

// Registreren
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${backendUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    document.getElementById("registerMessage").innerText = data.message;
  } catch (error) {
    document.getElementById("registerMessage").innerText = "Er is iets misgegaan.";
  }
});

// Wedstrijden ophalen
document.getElementById("loadMatches").addEventListener("click", async () => {
  try {
    const response = await fetch(`${backendUrl}/matches`);
    const matches = await response.json();

    const matchesList = document.getElementById("matchesList");
    matchesList.innerHTML = ""; // Clear the list
    matches.forEach((match) => {
      const listItem = document.createElement("li");
      listItem.innerText = `${match.team} vs ${match.opponent} om ${new Date(
        match.start_time
      ).toLocaleString()}`;
      matchesList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Fout bij het ophalen van wedstrijden:", error);
  }
});
