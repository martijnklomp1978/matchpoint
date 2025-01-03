const backendUrl = "https://matchpoint-vert.vercel.app"; // Backend-URL

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginError = document.getElementById("loginError"); // Verwijzing naar foutmelding

  loginError.innerText = ""; // Foutmelding resetten bij elke nieuwe poging

  try {
    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      // Alert en doorsturen naar welkomspagina
      alert(`Welkom ${data.email}`);
      window.location.href = "welcome.html"; // Doorverwijzing
    } else {
      const errorData = await response.json();
      loginError.innerText = errorData.message || "Combinatie email en wachtwoord niet correct, probeer opnieuw.";
    }
  } catch (error) {
    console.error("Fout bij inloggen:", error);
    loginError.innerText = "Er is een probleem opgetreden. Probeer later opnieuw.";
  }
});
