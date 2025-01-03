const backendUrl = "https://matchpoint-vert.vercel.app"; // Vervang met je backend-URL

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch(`${backendUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    document.getElementById("registerMessage").innerText = data.message;

    // Na succesvolle registratie, terug naar inloggen
    if (response.ok) {
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Fout bij registreren:", error);
  }
});
