const express = require("express");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    const name = req.query.name || "";

    // INTENTIONALLY VULNERABLE
    res.send(`
        <h1>XSS Demo</h1>

        <form method="GET">
            <input name="name" placeholder="Enter your name">
            <button type="submit">Submit</button>
        </form>

        <h2>Hello ${name}</h2>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
