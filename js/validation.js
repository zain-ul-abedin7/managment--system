import { employees } from './storage.js';

export function validateInput(target, editId) {
    if (target.tagName !== "INPUT" && target.tagName !== "SELECT") return;
    const val = target.value.trim();
    let err = "";

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (target.id === "email") {
        if (!val) {
            err = "This field is required.";
        } else if (!emailRegex.test(val)) {
            err = "Please enter a valid email address.";
        }
    } else if (target.validity.patternMismatch) {
        if (target.id === "name") err = "Name should contain only letters and spaces (2-50 characters).";
        else if (target.id === "mobile_number") err = "Please enter 7 to 12 numeric digits only.";
    } else if (target.validity.valueMissing) {
        err = "This field is required.";
    }

    const empList = Array.isArray(employees) ? employees : [];

    if (!err && target.id === "email" && empList.some(emp => emp.email && emp.email.toLowerCase() === val.toLowerCase() && emp.id != editId)) {
        err = "Email already used.";
    }
    if (!err && target.id === "mobile_number" && empList.some(emp => emp.mobile_number && emp.mobile_number === val && emp.id != editId)) {
        err = "Mobile number already used.";
    }

    target.setCustomValidity(err);
    const errorEl = document.getElementById(target.id + "Error");
    if (errorEl) errorEl.textContent = target.validationMessage;
    target.classList.toggle("invalid", !target.validity.valid);
}