import { createEmployee, updateEmployee, deleteEmployee, getEmployees } from './storage.js';
import { validateInput } from './validation.js';
import { saveAndRender } from './ui.js';

const form = document.getElementById("employeeForm");
const searchInput = document.getElementById("search");
const deleteModal = document.getElementById("deleteModal");

let deleteTargetId = null;

form.addEventListener("input", e => validateInput(e.target, form.dataset.editId));
form.addEventListener("change", e => validateInput(e.target, form.dataset.editId));

form.addEventListener("submit", async e => {
    e.preventDefault();

    Array.from(form.elements).forEach(input => validateInput(input, form.dataset.editId));

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const data = Object.fromEntries(new FormData(form));
    const id = form.dataset.editId;

    try {
        if (id) {
            await updateEmployee(id, data);
        } else {
            await createEmployee(data);
        }

        form.reset();
        await saveAndRender();
    } catch (err) {
        alert(`Save failed: ${err.message}`);
        console.error('Save failed:', err);
    }
});

form.addEventListener("reset", () => {
    delete form.dataset.editId;
    document.getElementById("submitBtn").textContent = "Add Employee";
    document.getElementById("formTitle").textContent = "Add Employee";
    document.getElementById("cancelBtn").classList.add("hidden");
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
    document.querySelectorAll("input, select").forEach(el => {
        el.setCustomValidity("");
        el.classList.remove("invalid");
    });
});

document.addEventListener("click", async e => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("edit") && id) {
        const employees = await getEmployees();
        const emp = employees.find(x => x.id == id);
        if (!emp) return;

        form.dataset.editId = id;

        Array.from(form.elements).forEach(input => {
            if (input.name && emp[input.name] !== undefined) {
                input.value = emp[input.name];
            }
            input.setCustomValidity("");
            validateInput(input, id);
        });

        document.getElementById("submitBtn").textContent = "Update Employee";
        document.getElementById("formTitle").textContent = "Edit Employee";
        document.getElementById("cancelBtn").classList.remove("hidden");
        form.scrollIntoView({ behavior: "smooth" });
    }

    if (e.target.classList.contains("delete") && id) {
        deleteTargetId = id;
        deleteModal.classList.remove("hidden");
    }

    if (e.target.id === "confirmDeleteBtn") {
        try {
            if (deleteTargetId) {
                await deleteEmployee(deleteTargetId);
                if (form.dataset.editId == deleteTargetId) form.reset();
                await saveAndRender();
            }
        } catch (err) {
            alert(`Delete failed: ${err.message}`);
            console.error('Delete failed:', err);
        }
        deleteModal.classList.add("hidden");
        deleteTargetId = null;
    }

    if (e.target.id === "cancelDeleteBtn") {
        deleteModal.classList.add("hidden");
        deleteTargetId = null;
    }
});

searchInput.addEventListener("input", saveAndRender);
saveAndRender();