const { prisma } = require('../_lib/prisma');

async function resolveDepartmentId(deptInput) {
    if (!deptInput) return 1;

    const asNumber = Number(deptInput);
    if (!Number.isNaN(asNumber)) return asNumber;

    const dept = await prisma.department.findFirst({
        where: { name: String(deptInput) },
        select: { id: true }
    });

    return dept?.id || 1;
}

async function resolveRoleId(roleInput) {
    if (!roleInput) return 1;

    const asNumber = Number(roleInput);
    if (!Number.isNaN(asNumber)) return asNumber;

    const role = await prisma.role.findFirst({
        where: { title: String(roleInput) },
        select: { id: true }
    });

    return role?.id || 1;
}

function formatEmployee(item) {
    return {
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
    };
}

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const rows = await prisma.employee.findMany({
                where: { status: 'active' },
                include: {
                    department: { select: { name: true } },
                    role: { select: { title: true } }
                },
                orderBy: { id: 'desc' }
            });

            res.status(200).json(rows.map(formatEmployee));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
        return;
    }

    if (req.method === 'POST') {
        const { name, email, country_code, mobile_number, department_id, role_id, department, role } = req.body || {};

        try {
            const validDeptId = await resolveDepartmentId(department_id || department);
            const validRoleId = await resolveRoleId(role_id || role);

            const created = await prisma.employee.create({
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
                id: created.id,
                name: created.name,
                email: created.email,
                country_code: created.country_code,
                mobile_number: created.mobile_number,
                department_id: created.department_id,
                role_id: created.role_id
            });
        } catch (err) {
            if (err.code === 'P2002') {
                res.status(409).json({ error: 'Email or mobile number already exists.' });
                return;
            }

            res.status(500).json({ error: err.message });
        }
        return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
};