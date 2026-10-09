const API_URL = '/api/employees';
export let employees = [];

export async function getEmployees() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        
        // Ensure employees is assigned an Array (fall back to [] if server returns an error object)
        employees = Array.isArray(data) ? data : [];
        return employees;
    } catch (err) {
        console.error("API Server connection failed:", err);
        employees = [];
        return [];
    }
}

export async function createEmployee(data) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function updateEmployee(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function deleteEmployee(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return await res.json();
}