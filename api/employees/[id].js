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

module.exports = async (req, res) => {
    const id = Number(req.query.id);

    if (Number.isNaN(id)) {
        res.status(400).json({ error: 'Invalid employee id' });
        return;
    }

    if (req.method === 'PUT') {
        const { name, email, country_code, mobile_number, department_id, role_id, department, role } = req.body || {};

        try {
            const validDeptId = await resolveDepartmentId(department_id || department);
            const validRoleId = await resolveRoleId(role_id || role);

            await prisma.employee.update({
                where: { id },
                data: {
                    name,
                    email,
                    country_code: country_code || '+1',
                    mobile_number,
                    department_id: validDeptId,
                    role_id: validRoleId
                }
            });

            res.status(200).json({ message: 'Employee updated successfully' });
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
        return;
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.employee.update({
                where: { id },
                data: { status: 'inactive' }
            });

            res.status(200).json({ message: 'Employee deactivated successfully' });
        } catch (err) {
            if (err.code === 'P2025') {
                res.status(404).json({ error: 'Employee not found' });
                return;
            }

            res.status(500).json({ error: err.message });
        }
        return;
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
};