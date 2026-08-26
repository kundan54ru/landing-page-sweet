/*
  SWEET MOMENTS
  WhatsApp: 918603286813
  Google Sheets: paste your deployed Google Apps Script Web App URL below.
*/

const WHATSAPP_NUMBER = "918603286813";
const BRAND_NAME = "Sweet Moments";

/* IMPORTANT:
   Replace this with your Google Apps Script Web App URL.
   Example:
   https://script.google.com/macros/s/ABC123.../exec
*/
const GOOGLE_SHEETS_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const loadingText = document.getElementById("loadingText");
const registrationSection = document.getElementById("registrationSection");
const thankYouSection = document.getElementById("thankYouSection");
const whatsappButton = document.getElementById("whatsappButton");

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

function fireGoogleAdsConversion() {
  if (typeof gtag !== "function") return;

  if (
    typeof GOOGLE_ADS_CONVERSION_ID !== "string" ||
    GOOGLE_ADS_CONVERSION_ID.includes("XXXXXXXX") ||
    typeof GOOGLE_ADS_CONVERSION_LABEL !== "string" ||
    GOOGLE_ADS_CONVERSION_LABEL.includes("XXXXXXXX")
  ) {
    console.warn("Google Ads conversion ID/label is not configured yet.");
    return;
  }

  gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_CONVERSION_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    value: 1.0,
    currency: "INR"
  });
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

function showThankYou(name) {
  const message =
    `Hello ${name}, I have just completed the registration on the ${BRAND_NAME} website. ` +
    `I would like to get more information.`;

  whatsappButton.href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  registrationSection.classList.add("hidden");
  document.querySelector(".hero-copy").classList.add("hidden");
  thankYouSection.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    // Lead is saved first. Conversion fires only after a successful save.
    await saveLeadToGoogleSheets(lead);

    fireGoogleAdsConversion();
    showThankYou(lead.name);
  } catch (error) {
    console.error(error);
    alert("We could not submit your registration right now. Please try again.");
    submitBtn.disabled = false;
    submitText.classList.remove("hidden");
    loadingText.classList.add("hidden");
  }
});
