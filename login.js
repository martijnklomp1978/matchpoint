const backendUrl = "https://matchpoint-vert.vercel.app"; // Vervang met je backend-URL

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(`Welkom ${data.email}`);
      // Stuur naar welkomspagina
      window.location.href = `welcome.html?email=${data.email}`;
    } else {
      document.getElementById("loginError").innerText =
        "Combinatie email en wachtwoord niet correct, probeer opnieuw.";
    }
  } catch (error) {
    console.error("Fout bij inloggen:", error);
  }
});
