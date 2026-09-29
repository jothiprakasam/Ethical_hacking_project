const express = require("express");
const escapeHtml = require("escape-html");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    const name = escapeHtml(req.query.name || "");

    res.send(`
        <h1>XSS Demo - Fixed</h1>

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
