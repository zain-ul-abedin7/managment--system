import { getEmployees } from './storage.js';

const tableBody = document.getElementById("employeeTable");
const searchInput = document.getElementById("search");
const rowTemplate = document.getElementById("employeeRowTemplate");

const departmentNames = {
    "1": "Engineering",
    "2": "Human Resources",
    "3": "Finance",
    "4": "Information Technology (IT)",
    "5": "Accounting",
    "6": "Marketing",
    "7": "Sales",
    "8": "Customer Service",
    "9": "Operations",
    "10": "Legal"
};

const roleTitles = {
    "1": "Admin",
    "2": "Developer",
    "3": "Manager",
    "4": "Engineer",
    "5": "Coordinators"
};

export async function saveAndRender() {
    const currentEmployees = await getEmployees();
    const text = searchInput.value.trim().toLowerCase();
    
    tableBody.replaceChildren();
    
    const filtered = text.length >= 2 
        ? currentEmployees.filter(e => Object.values(e).some(v => String(v).toLowerCase().includes(text)))
        : currentEmployees;
    
    if (!filtered.length) {
        const tr = document.createElement("tr");
        tr.className = "empty-state";
        
        const td = document.createElement("td");
        td.colSpan = 6;
        td.textContent = "No employees found.";
        
        tr.appendChild(td);
        tableBody.appendChild(tr);
    } else {
        filtered.forEach(emp => {
            const clone = rowTemplate.content.cloneNode(true);
            const tr = clone.querySelector("tr");
            
            tr.querySelector(".emp-name").textContent = emp.name || "";
            tr.querySelector(".emp-email").textContent = emp.email || "";
            tr.querySelector(".emp-department").textContent = emp.department || departmentNames[emp.department_id] || "N/A";
            tr.querySelector(".emp-role").textContent = emp.role || roleTitles[emp.role_id] || "N/A";
            
            const fullPhone = (emp.country_code ? emp.country_code + " " : "") + (emp.mobile_number || "");
            tr.querySelector(".emp-number").textContent = fullPhone;
            
            tr.querySelector(".edit").dataset.id = emp.id;
            tr.querySelector(".delete").dataset.id = emp.id;
            
            tableBody.appendChild(tr);
        });
    }
    
    document.getElementById("totalEmployees").textContent = currentEmployees.length;
    document.getElementById("totalDepartments").textContent = new Set(
        currentEmployees.map(e => e.department_id ? String(e.department_id) : "")
    ).size;
}