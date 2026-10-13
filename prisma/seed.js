// Seeds lookup tables (departments, roles) required by the employee form.
// IDs MUST match the <option value="..."> entries in index.html (and the
// name maps in js/ui.js), because the form submits department_id / role_id.
// Safe to run repeatedly: rows are upserted by id.
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const departments = [
    { id: 1, code: 'ENG', name: 'Engineering' },
    { id: 2, code: 'HR', name: 'Human Resources' },
    { id: 3, code: 'FIN', name: 'Finance' },
    { id: 4, code: 'IT', name: 'Information Technology (IT)' },
    { id: 5, code: 'ACC', name: 'Accounting' },
    { id: 6, code: 'MKT', name: 'Marketing' },
    { id: 7, code: 'SLS', name: 'Sales' },
    { id: 8, code: 'CS', name: 'Customer Service' },
    { id: 9, code: 'OPS', name: 'Operations' },
    { id: 10, code: 'LEG', name: 'Legal' }
];

const roles = [
    { id: 1, title: 'Admin' },
    { id: 2, title: 'Developer' },
    { id: 3, title: 'Manager' },
    { id: 4, title: 'Engineer' },
    { id: 5, title: 'Coordinators' }
];

async function main() {
    for (const { id, code, name } of departments) {
        await prisma.department.upsert({
            where: { id },
            update: { code, name },
            create: { id, code, name }
        });
    }

    for (const { id, title } of roles) {
        await prisma.role.upsert({
            where: { id },
            update: { title },
            create: { id, title }
        });
    }

    // We inserted explicit ids, so advance the Postgres autoincrement
    // sequences past them to avoid collisions on future inserts.
    await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('departments', 'id'), (SELECT MAX(id) FROM departments))`
    );
    await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT MAX(id) FROM roles))`
    );

    console.log(`Seeded ${departments.length} departments and ${roles.length} roles.`);
}

main()
    .catch(err => {
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
