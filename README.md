# Employee Management System

A simple Employee Management System with an HTML, CSS, and JavaScript frontend,
an Express API, and a MySQL database. It lets you add, edit, delete, and search
employees.

## Features

- **Add employees** with name, email, department, and mobile number.
- **Edit / update employees** — click "Edit" on any row to load that employee into the form, make changes, and save them without creating a duplicate.
- **Delete employees** with a confirmation prompt to prevent accidental deletion.
- **Search** across name, email, department, and mobile number at the same time.
- **Live, field-level validation** — each field (name, email, department, mobile number) is validated as you type/leave the field, with a specific error message shown right under that field, plus a red border on invalid inputs.
- **Duplicate prevention** — email and mobile number must be unique across employees (except when editing that same employee).
- **Empty states** — a friendly message is shown when there are no employees yet, and a different message when a search returns no matches.
- **Employee statistics** — live counters for total employees and total unique departments.
- **Persistent storage** — all employee data is saved in the browser's `localStorage`, so it survives page reloads.

## Run with Docker Compose

Docker Compose runs the web app, API, and MySQL database together.

1. Install Docker Desktop and start it.
2. Copy `.env.example` to `.env` and change the database password.
3. From the project directory, run:

   ```sh
   docker compose up --build
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The database is initialized from `database/emp.sql` on its first start, and its
data is persisted in the `mysql_data` Docker volume. To stop the app, run
`docker compose down`. To also permanently delete its database data, run
`docker compose down -v`.

To install the Node dependencies and run the API outside Docker, use
`npm install` followed by `npm start`. This also requires a MySQL server with
the `employee_management` schema initialized from `database/emp.sql`.

## Deployment (Vercel + Prisma)

This project now includes Vercel serverless API routes in `api/` that use
Prisma, so you can deploy on Vercel without running a local MySQL process.

### 1. Create a hosted MySQL database (free tier)

Use any provider that gives a public MySQL endpoint (for example PlanetScale,
Aiven free trial, or another MySQL-compatible serverless/free-tier provider).

1. Create database `employee_management`.
2. Import `database/emp.sql`.
3. Copy the MySQL connection string.

### 2. Configure environment variables in Vercel

Set this variable in your Vercel project settings:

- `DATABASE_URL` = `mysql://USER:PASSWORD@HOST:3306/employee_management`

### 3. Deploy

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Deploy.

`postinstall` runs `prisma generate` automatically during build.

### 4. Verify after deploy

- `GET /api/health` should return `{ "status": "ok" }`.
- Open the app root URL and test create/edit/delete employee.

## Local Development Notes

- `server.js` still works for local non-Vercel runtime with direct MySQL envs
   (`DB_HOST`, `DB_USER`, etc.).
- Vercel uses `api/` serverless functions and `DATABASE_URL` with Prisma.

## Technologies Used

- **HTML5** — page structure and form markup.
- **CSS3** — layout and styling (flexbox, custom validation/empty-state styles).
- **JavaScript (Vanilla, ES6+)** — all application logic: form handling, validation, rendering, search, and storage. No frameworks or libraries are used.

## How Data Is Stored

Employee records are stored in MySQL. With Docker Compose, the database files
are persisted in the `mysql_data` volume and the schema and initial departments
and roles are created from `database/emp.sql` on first startup.

## Validation Rules

| Field      | Rule                                                              |
|------------|---------------------------------------------------------------------|
| Name       | Required; letters and spaces only, 2-50 characters                  |
| Email      | Required; must be a valid email format; must be unique              |
| Department | Required; letters, numbers, `&` and `-` allowed, 2-50 characters    |
| Mobile     | Required; must start with `03` followed by 9 digits; must be unique |
