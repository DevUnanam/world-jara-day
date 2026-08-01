const eventDate = new Date("2026-08-28T07:00:00+01:00").getTime();
const ids = ["days", "hours", "minutes", "seconds"];
const registrationEndpoint = "https://script.google.com/macros/s/AKfycbzeO-xiVtEzq6JkXpRr2BjxHIHpok7mkH649EcpgkZ-283Q8AO0t5sAHhVZ-LEMgd4e/exec";

function updateCountdown() {
  const remaining = Math.max(0, eventDate - Date.now());
  const values = [
    Math.floor(remaining / 86400000),
    Math.floor((remaining % 86400000) / 3600000),
    Math.floor((remaining % 3600000) / 60000),
    Math.floor((remaining % 60000) / 1000),
  ];
  ids.forEach((id, index) => {
    document.getElementById(id).textContent = String(values[index]).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

document.querySelectorAll("[data-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const ilyaInput = form.querySelector('[name="ilya"]');
    if (ilyaInput && ilyaInput.value.trim()) {
      const rawIlya = ilyaInput.value.trim().replace(/^ilya\s+/i, "");
      ilyaInput.value = `Ilya ${rawIlya}`;
    }
    const message = form.querySelector(".form-message");
    const button = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    button.disabled = true;
    button.textContent = "Submitting...";
    message.textContent = "Submitting your registration...";
    message.classList.remove("hidden");

    try {
      await fetch(registrationEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      message.textContent = "Registration submitted successfully. Thank you, we have received your details.";
      form.reset();
    } catch (error) {
      message.textContent = "Submission could not be completed. Please check your connection and try again.";
    } finally {
      button.disabled = false;
      button.textContent = "Submit registration interest";
    }
  });
});

const canvas = document.getElementById("flyerCanvas");
const ctx = canvas.getContext("2d");
const template = new Image();
template.src = "world-gyration-attending-template.jpeg";
let attendeePhoto = null;

function drawFlyer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  if (attendeePhoto) {
    const photoX = 540;
    const photoY = 704;
    const photoRadius = 154;
    const photoSize = photoRadius * 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
    ctx.clip();
    const scale = Math.max(photoSize / attendeePhoto.width, photoSize / attendeePhoto.height);
    const width = attendeePhoto.width * scale;
    const height = attendeePhoto.height * scale;
    ctx.drawImage(attendeePhoto, photoX - width / 2, photoY - height / 2, width, height);
    ctx.restore();
  }

  const name = document.getElementById("attendeeName").value.trim();
  if (name) {
    ctx.fillStyle = "#f7f0df";
    ctx.font = "700 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const displayName = name.length > 28 ? `${name.slice(0, 25)}...` : name;
    ctx.fillText(displayName.toUpperCase(), 540, 818);
  }
}

template.onload = drawFlyer;
document.getElementById("attendeeName").addEventListener("input", drawFlyer);
document.getElementById("attendeePhoto").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    attendeePhoto = new Image();
    attendeePhoto.onload = drawFlyer;
    attendeePhoto.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById("downloadFlyer").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "world-gyration-im-attending.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
