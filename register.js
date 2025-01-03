const backendUrl = "https://matchpoint-vert.vercel.app"; // Backend-URL

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); // Voorkom dat de pagina herlaadt

  // Haal gegevens uit het formulier
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    // Verzend het POST-verzoek naar de backend
    const response = await fetch(`${backendUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Controleer de response
    if (!response.ok) {
      throw new Error(`Fout: ${response.status} ${response.statusText}`);
    }

    // Verwerk de response
    const data = await response.json();
    document.getElementById("registerMessage").innerText = data.message;

    // Na succesvolle registratie, terug naar inloggen
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } catch (error) {
    console.error("Fout bij registreren:", error);
    document.getElementById("registerMessage").innerText =
      "Er is een fout opgetreden bij het registreren.";
  }
});
