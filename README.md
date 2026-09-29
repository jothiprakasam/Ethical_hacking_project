# SQL Injection Demonstration using Node.js and PostgreSQL

##  Assignment

**Objective:**
Design and develop a simple web application to demonstrate **SQL Injection**, analyze the vulnerability, and implement appropriate security countermeasures.

## 🛠️ Technologies Used

* Node.js
* Express.js
* PostgreSQL
* HTML
* SQL

##  Project Structure

```text
sql-injection-demo/
│
├── app.js
├── package.json
└── public/
    └── index.html
```

---

# 1. Prerequisites

Make sure the following are installed:

```bash
node --version
npm --version
psql --version
```

If Node.js is not installed:

```bash
sudo apt update
sudo apt install nodejs npm
```

PostgreSQL:

```bash
sudo apt install postgresql postgresql-contrib
```

---

# 2. Create the Node.js Project

```bash
mkdir sql-injection-demo
cd sql-injection-demo
```

Initialize the project:

```bash
npm init -y
```

Install the required packages:

```bash
npm install express pg
```

---

# 3. PostgreSQL Setup

Start PostgreSQL:

```bash
sudo systemctl start postgresql
```

Check the status:

```bash
sudo systemctl status postgresql
```

Enter PostgreSQL:

```bash
sudo -u postgres psql
```

## Create Database

```sql
CREATE DATABASE security_demo;
```

Connect to the database:

```sql
\c security_demo
```

---

# 4. Create Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(100)
);
```

Insert sample data:

```sql
INSERT INTO users (username, password) VALUES
('alice', 'alice123'),
('bob', 'bob123'),
('admin', 'admin123');
```

Verify the data:

```sql
SELECT * FROM users;
```

Expected output:

```text
 id | username | password
----+----------+----------
  1 | alice    | alice123
  2 | bob      | bob123
  3 | admin    | admin123
```

Exit PostgreSQL:

```sql
\q
```

---

# 5. Configure PostgreSQL Password

If the PostgreSQL password needs to be changed, enter PostgreSQL using:

```bash
sudo -u postgres psql
```

Then:

```sql
ALTER USER postgres WITH PASSWORD 'NewPassword123';
```

Exit:

```sql
\q
```

Test the login:

```bash
psql -U postgres -h localhost -W
```

Enter the password when prompted.

---

# 6. Vulnerable Node.js Application

Create `app.js`:

```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "security_demo",
    password: "YOUR_POSTGRES_PASSWORD",
    port: 5432
});

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send(`
        <h2>SQL Injection Demo</h2>

        <form method="GET" action="/search">
            <input name="username" placeholder="Enter username">
            <button type="submit">Search</button>
        </form>
    `);
});

app.get("/search", async (req, res) => {
    const username = req.query.username;

    // INTENTIONALLY VULNERABLE
    const query =
        "SELECT * FROM users WHERE username = '" +
        username +
        "'";

    try {
        const result = await pool.query(query);

        res.send(`
            <h3>SQL Query</h3>
            <pre>${query}</pre>

            <h3>Result</h3>
            <pre>${JSON.stringify(result.rows, null, 2)}</pre>

            <a href="/">Back</a>
        `);
    } catch (error) {
        res.status(500).send(`
            <h3>Database Error</h3>
            <pre>${error.message}</pre>
        `);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
```

> **Note:** This application is intentionally vulnerable and should only be used in a local test environment.

---

# 7. Run the Application

Start the application:

```bash
node app.js
```

You should see:

```text
Server running at http://localhost:3000
```

Open the application:

```text
http://localhost:3000
```

---

# 8. Normal Input Test

Enter:

```text
alice
```

The application generates:

```sql
SELECT * FROM users WHERE username = 'alice'
```

The result should contain Alice's record.

---

# 9. SQL Injection Demonstration

The application directly concatenates user input into the SQL query.

Use the following test input:

```text
' OR '1'='1
```

For the local demonstration application, the URL-encoded request is:

```text
http://localhost:3000/search?username=%27%20OR%20%271%27%3D%271
```

The application constructs a query equivalent to:

```sql
SELECT * FROM users WHERE username = '' OR '1'='1'
```

Since:

```sql
'1'='1'
```

is always true, the query can return multiple records instead of only one matching username.

### Result

The application may display:

```text
alice
bob
admin
```

This demonstrates how unsanitized input can alter the intended SQL statement.

---

# 10. Why the Vulnerability Exists

The vulnerable code is:

```javascript
const query =
    "SELECT * FROM users WHERE username = '" +
    username +
    "'";
```

The user's input is directly concatenated into the SQL query.

Conceptually:

```text
User Input
    ↓
String Concatenation
    ↓
SQL Query
    ↓
PostgreSQL
```

The application cannot reliably distinguish between:

```text
Data
```

and:

```text
SQL syntax
```

---

# 11. Security Fix

The recommended solution is to use **parameterized queries**.

Replace the vulnerable code with:

```javascript
const query = "SELECT * FROM users WHERE username = $1";

const result = await pool.query(query, [username]);
```

The complete route becomes:

```javascript
app.get("/search", async (req, res) => {
    const username = req.query.username;

    const query = "SELECT * FROM users WHERE username = $1";

    try {
        const result = await pool.query(query, [username]);

        res.send(`
            <h3>SQL Query</h3>
            <pre>${query}</pre>

            <h3>Result</h3>
            <pre>${JSON.stringify(result.rows, null, 2)}</pre>

            <a href="/">Back</a>
        `);
    } catch (error) {
        res.status(500).send(`
            <h3>Database Error</h3>
            <pre>${error.message}</pre>
        `);
    }
});
```

Now user input is treated as **data**, not SQL syntax.

---

# 12. Vulnerable vs Secure

| Vulnerable                     | Secure                        |
| ------------------------------ | ----------------------------- |
| Direct string concatenation    | Parameterized query           |
| User input becomes part of SQL | User input is treated as data |
| SQL Injection possible         | SQL Injection prevented       |
| `"... '" + username + "'"`     | `"WHERE username = $1"`       |
| Unsafe                         | Recommended                   |

### Vulnerable

```javascript
const query =
    "SELECT * FROM users WHERE username = '" +
    username +
    "'";
```

### Secure

```javascript
const query =
    "SELECT * FROM users WHERE username = $1";

const result = await pool.query(query, [username]);
```

---

# 13. Security Countermeasures

The following measures should be implemented to prevent SQL Injection:

### 1. Use Parameterized Queries

```javascript
const query = "SELECT * FROM users WHERE username = $1";

await pool.query(query, [username]);
```

### 2. Avoid Dynamic SQL

Do not construct SQL statements by directly concatenating user input.

### 3. Input Validation

Validate input according to the expected format.

For example, usernames can be restricted to:

```text
Letters
Numbers
Underscore
```

### 4. Least Database Privilege

The application database account should only have the permissions it requires.

### 5. Do Not Expose Database Errors

Instead of displaying:

```javascript
error.message
```

to users, return a generic error:

```text
An internal server error occurred.
```

Detailed database errors should be logged securely on the server.

---

# 14. Testing

### Normal Request

```text
http://localhost:3000/search?username=alice
```

Expected:

```text
Alice's record
```

### SQL Injection Test

```text
http://localhost:3000/search?username=%27%20OR%20%271%27%3D%271
```

Expected in the vulnerable version:

```text
Multiple user records
```

### Secure Version

Use the same SQL injection test against the fixed application.

The input should be treated as a username value rather than executable SQL syntax.

---

# 15. Demonstration Flow

```text
                ┌─────────────────┐
                │    User Input   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Node.js /       │
                │ Express Server  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ SQL Query       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                └─────────────────┘
```

### Vulnerable Application

```text
Input
  ↓
String Concatenation
  ↓
Modified SQL Query
  ↓
PostgreSQL
  ↓
Unexpected Results
```

### Secure Application

```text
Input
  ↓
Parameterized Query
  ↓
Input treated as data
  ↓
PostgreSQL
  ↓
Expected Results
```

---


