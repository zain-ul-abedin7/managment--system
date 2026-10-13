const API_URL = '/api/employees';
export let employees = [];

async function parseJsonSafe(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function assertOk(res) {
    if (res.ok) return;

    const payload = await parseJsonSafe(res);
    const message = payload?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
}

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
    await assertOk(res);
    return await parseJsonSafe(res);
}

export async function updateEmployee(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    await assertOk(res);
    return await parseJsonSafe(res);
}

export async function deleteEmployee(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    await assertOk(res);
    return await parseJsonSafe(res);
}