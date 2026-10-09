-- Query 1: Join Employees with Departments and Roles
SELECT 
    e.id AS employee_id,
    e.name AS employee_name,
    d.name AS department,
    r.title AS role,
    l.city AS office_location
FROM employees e
JOIN departments d ON e.department_id = d.id
JOIN roles r ON e.role_id = r.id
JOIN locations l ON d.location_id = l.id;

-- Query 2: Check Audit Logs with User Details
SELECT 
    a.id AS log_id,
    a.event_type,
    a.description,
    e.name AS performed_by,
    a.created_at
FROM audit_logs a
JOIN employees e ON a.performed_by_employee_id = e.id;