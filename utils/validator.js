// validator.js

function validateName(name) {
    return /^[a-zA-Z\s]+$/.test(name.trim()); // Allows letters and spaces
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email validation
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone.trim()); // Accepts 10-digit phone numbers
}

// Ensure functions are accessible globally
window.validateName = validateName;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
