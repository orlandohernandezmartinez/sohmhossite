(() => {
    const form = document.getElementById("waitlist-form");
    const input = document.getElementById("waitlist-input");
    const btn = document.getElementById("waitlist-submit");
    const feedback = document.getElementById("waitlist-message");
  
    const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbxXJ-twcmI54L1cFrwCYJZV3CV9IUJLi8P0JOjtaqcgQKltfrIC8H3A8RFfyg9HaJ_EzA/exec";
  
    const setFeedback = (msg) => {
      feedback.textContent = msg;
    };
  
    const clearFeedback = () => {
      feedback.textContent = "";
    };
  
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
    input.addEventListener("input", () => {
      if (feedback.textContent) clearFeedback();
    });
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = input.value.trim();
  
      if (!isValidEmail(email)) {
        setFeedback("Mail inválido");
        return;
      }
  
      if (!SUBMIT_URL) {
        setFeedback("Registro exitoso");
        input.value = "";
        return;
      }
  
      try {
        btn.disabled = true;
  
        const res = await fetch(SUBMIT_URL, {
          method: "POST",
          body: new URLSearchParams({
            email,
            ts: new Date().toISOString(),
            ua: navigator.userAgent,
          }),
        });
  
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Bad response");
        if (text.trim().toLowerCase() !== "ok") throw new Error(text);
  
        setFeedback("Registro exitoso");
        input.value = "";
      } catch (err) {
        setFeedback("Error al registrar. Intenta de nuevo.");
      } finally {
        btn.disabled = false;
      }
    });
  })();