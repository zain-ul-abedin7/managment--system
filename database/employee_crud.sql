USE employee_management;

-- 1. CREATE (Insert New Employee)
INSERT INTO employees (name, email, country_code, mobile_number, department_id, role_id, hire_date, status) 
VALUES ('Mark Taylor', 'mark.t@example.com', '+1', '5550001111', 1, 1, '2024-03-15', 'active');

-- 2. READ (Fetch Employee Data)
-- Read All Employees with Department & Role
SELECT 
    e.id, 
    e.name, 
    e.email, 
    e.mobile_number, 
    d.name AS department, 
    r.title AS role, 
    e.status
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN roles r ON e.role_id = r.id;

-- Read Single Employee by ID
SELECT * FROM employees WHERE id = 1;

-- 3. UPDATE (Modify Existing Record)
UPDATE employees 
SET 
    mobile_number = '5559998888',
    status = 'active'
WHERE id = 1;

-- 4. DELETE (Deactivate Record - Soft Delete)
UPDATE employees 
SET status = 'inactive' 
WHERE id = 1;