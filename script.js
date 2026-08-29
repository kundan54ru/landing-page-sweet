/*
  SWEET MOMENTS
  WhatsApp: 918603286813
  Google Sheets: paste your deployed Google Apps Script Web App URL below.

  Google Tag / Google Ads code is intentionally NOT included here.
  Tracking will be done on the separate /thank-you/ page using Google Tag Manager.
*/

const WHATSAPP_NUMBER = "918603286813";
const BRAND_NAME = "Sweet Moments";
const GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwVGwz_ex9vf9RTzCVsOo6auvMqD3ykhHDTpLvUY2mk0TIdFWROi2AzjKRAcf22mpVy/exec";

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const loadingText = document.getElementById("loadingText");

const fields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  location: document.getElementById("location"),
  consent: document.getElementById("consent")
};

const errors = {
  fullName: document.getElementById("fullNameError"),
  email: document.getElementById("emailError"),
  phone: document.getElementById("phoneError"),
  location: document.getElementById("locationError"),
  consent: document.getElementById("consentError")
};

fields.phone.addEventListener("input", () => {
  fields.phone.value = fields.phone.value.replace(/\D/g, "").slice(0, 10);
});

function clearErrors() {
  Object.values(errors).forEach(el => el.textContent = "");
  ["fullName", "email", "phone", "location"].forEach(key => fields[key].classList.remove("invalid"));
}

function setError(name, message) {
  errors[name].textContent = message;
  if (name !== "consent") fields[name].classList.add("invalid");
}

function validateForm() {
  clearErrors();
  let valid = true;

  const name = fields.fullName.value.trim();
  const email = fields.email.value.trim();
  const phone = fields.phone.value.trim();
  const location = fields.location.value.trim();

  if (!name) {
    setError("fullName", "Please enter your full name.");
    valid = false;
  } else if (name.length < 2) {
    setError("fullName", "Please enter a valid name.");
    valid = false;
  }

  if (!email) {
    setError("email", "Please enter your email address.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (!phone) {
    setError("phone", "Please enter your mobile number.");
    valid = false;
  } else if (!/^[6-9]\d{9}$/.test(phone)) {
    setError("phone", "Please enter a valid 10-digit mobile number.");
    valid = false;
  }

  if (!location) {
    setError("location", "Please enter your area or location.");
    valid = false;
  }

  if (!fields.consent.checked) {
    setError("consent", "Please accept the consent checkbox.");
    valid = false;
  }

  return valid;
}

async function saveLeadToGoogleSheets(lead) {
  if (!GOOGLE_SHEETS_WEB_APP_URL ||
      GOOGLE_SHEETS_WEB_APP_URL.includes("PASTE_YOUR")) {
    console.warn("Google Sheets Web App URL is not configured yet.");
    return { saved: false, reason: "not_configured" };
  }

  const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(lead),
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error("Google Sheets request failed.");
  }

  return { saved: true };
}

function goToThankYouPage(lead) {
  // Keep the lead data only in this browser session.
  // The name is used on the Thank You page to build the WhatsApp message.
  sessionStorage.setItem("sweetMomentsLeadName", lead.name);
  sessionStorage.setItem("sweetMomentsLeadSubmitted", "1");

  // This creates the real URL:
  // /landing-page-sweet/thank-you/
  window.location.href = "./thank-you/";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitText.classList.add("hidden");
  loadingText.classList.remove("hidden");

  const lead = {
    name: fields.fullName.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    location: fields.location.value.trim(),
    source: "Google Ads Landing Page",
    submittedAt: new Date().toISOString()
  };

  try {
    // Lead is saved first. After this succeeds (or Sheets is not configured),
    // the user is sent to the separate Thank You URL.
    await saveLeadToGoogleSheets(lead);
    goToThankYouPage(lead);
  } catch (error) {
    console.error(error);
    alert("We could not submit your registration right now. Please try again.");
    submitBtn.disabled = false;
    submitText.classList.remove("hidden");
    loadingText.classList.add("hidden");
  }
});
