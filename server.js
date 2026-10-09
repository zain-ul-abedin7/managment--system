const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'hello123',
    database: process.env.DB_NAME || 'employee_management'
});

// Helper function to convert Department Name/ID to integer department_id
async function resolveDepartmentId(deptInput) {
    if (!deptInput) return 1; // Default fallback
    if (!isNaN(deptInput)) return parseInt(deptInput, 10);

    try {
        const [rows] = await db.query('SELECT id FROM departments WHERE name = ? LIMIT 1', [deptInput]);
        if (rows.length > 0) return rows[0].id;
    } catch (e) {
        console.error("Department lookup error:", e.message);
    }
    return 1; // Fallback to ID 1 if not found
}

// Helper function to convert Role Title/ID to integer role_id
async function resolveRoleId(roleInput) {
    if (!roleInput) return 1; // Default fallback
    if (!isNaN(roleInput)) return parseInt(roleInput, 10);

    try {
        const [rows] = await db.query('SELECT id FROM roles WHERE title = ? LIMIT 1', [roleInput]);
        if (rows.length > 0) return rows[0].id;
    } catch (e) {
        console.error("Role lookup error:", e.message);
    }
    return 1; // Fallback to ID 1 if not found
}

// GET /api/employees - Fetch active employees
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.id, e.name, e.email, e.country_code, e.mobile_number, e.department_id, e.role_id,
                   d.name AS department, r.title AS role, e.status
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN roles r ON e.role_id = r.id
            WHERE e.status = 'active'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/employees - Insert new employee
app.post('/api/employees', async (req, res) => {
    const { name, email, country_code, mobile_number, department_id, role_id, department, role } = req.body;
    try {
        // Resolve Department and Role IDs from either name or ID input
        const validDeptId = await resolveDepartmentId(department_id || department);
        const validRoleId = await resolveRoleId(role_id || role);

        const [result] = await db.query(`
            INSERT INTO employees (name, email, country_code, mobile_number, department_id, role_id, hire_date, status)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active')
        `, [name, email, country_code || '+1', mobile_number, validDeptId, validRoleId]);

        res.json({ id: result.insertId, name, email, country_code, mobile_number, department_id: validDeptId, role_id: validRoleId });
    } catch (err) {
        console.error("SQL Insert Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/employees/:id - Update existing employee
app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, country_code, mobile_number, department_id, role_id, department, role } = req.body;
    try {
        const validDeptId = await resolveDepartmentId(department_id || department);
        const validRoleId = await resolveRoleId(role_id || role);

        await db.query(`
            UPDATE employees 
            SET name = ?, email = ?, country_code = ?, mobile_number = ?, department_id = ?, role_id = ?
            WHERE id = ?
        `, [name, email, country_code || '+1', mobile_number, validDeptId, validRoleId, id]);

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error("SQL Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/employees/:id - Soft delete employee
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`UPDATE employees SET status = 'inactive' WHERE id = ?`, [id]);
        res.json({ message: 'Employee deactivated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/style.css', (req, res) => res.sendFile(path.join(__dirname, 'style.css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
    console.log(`Employee Management System running at http://localhost:${port}`);
});