require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { prisma } = require('./api/_lib/prisma');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to convert Department Name/ID to integer department_id
async function resolveDepartmentId(deptInput) {
    if (!deptInput) return 1;
    if (!Number.isNaN(Number(deptInput))) return Number(deptInput);

    const row = await prisma.department.findFirst({
        where: { name: String(deptInput) },
        select: { id: true }
    });
    return row?.id || 1;
}

// Helper function to convert Role Title/ID to integer role_id
async function resolveRoleId(roleInput) {
    if (!roleInput) return 1;
    if (!Number.isNaN(Number(roleInput))) return Number(roleInput);

    const row = await prisma.role.findFirst({
        where: { title: String(roleInput) },
        select: { id: true }
    });
    return row?.id || 1;
}

// GET /api/employees - Fetch active employees
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(503).json({ error: err.message || String(err) });
    }
});

app.get('/api/employees', async (req, res) => {
    try {
        const rows = await prisma.employee.findMany({
            where: { status: 'active' },
            include: {
                department: { select: { name: true } },
                role: { select: { title: true } }
            },
            orderBy: { id: 'desc' }
        });

        const response = rows.map(item => ({
            id: item.id,
            name: item.name,
            email: item.email,
            country_code: item.country_code,
            mobile_number: item.mobile_number,
            department_id: item.department_id,
            role_id: item.role_id,
            department: item.department?.name || null,
            role: item.role?.title || null,
            status: item.status
        }));

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/employees - Insert new employee
app.post('/api/employees', async (req, res) => {
    const { name, email, country_code, mobile_number, department_id, role_id, department, role } = req.body;
    try {
        const validDeptId = await resolveDepartmentId(department_id || department);
        const validRoleId = await resolveRoleId(role_id || role);

        const result = await prisma.employee.create({
            data: {
                name,
                email,
                country_code: country_code || '+1',
                mobile_number,
                department_id: validDeptId,
                role_id: validRoleId,
                hire_date: new Date(),
                status: 'active'
            }
        });

        res.status(201).json({
            id: result.id,
            name: result.name,
            email: result.email,
            country_code: result.country_code,
            mobile_number: result.mobile_number,
            department_id: result.department_id,
            role_id: result.role_id
        });
    } catch (err) {
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Email or mobile number already exists.' });
            return;
        }

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

        await prisma.employee.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                country_code: country_code || '+1',
                mobile_number,
                department_id: validDeptId,
                role_id: validRoleId
            }
        });

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Email or mobile number already exists.' });
            return;
        }

        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/employees/:id - Soft delete employee
app.delete('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.employee.update({
            where: { id: Number(id) },
            data: { status: 'inactive' }
        });

        res.json({ message: 'Employee deactivated successfully' });
    } catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ error: 'Employee not found' });
            return;
        }

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