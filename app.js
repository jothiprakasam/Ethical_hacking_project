const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "security_demo",
    password: "", // passwword postgress user
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
