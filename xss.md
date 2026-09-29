# Cross-Site Scripting (XSS) Vulnerability Demonstration

## Assignment

**Objective:**
Design and develop a simple web application to demonstrate a **Cross-Site Scripting (XSS)** vulnerability, analyze the weakness, and implement suitable security countermeasures.

## 🛠️ Technologies Used

* Node.js
* Express.js
* HTML
* JavaScript

## Project Structure

```text
xss-demo/
│
├── app.js
└── package.json
```

---

# 1. Prerequisites

Check whether Node.js and npm are installed:

```bash
node --version
npm --version
```

If they are not installed:

```bash
sudo apt update
sudo apt install nodejs npm
```

---

# 2. Create the Node.js Project

Create the project directory:

```bash
mkdir xss-demo
cd xss-demo
```

Initialize the Node.js project:

```bash
npm init -y
```

Install Express:

```bash
npm install express
```

---

# 3. Vulnerable Application

Create a file named:

```text
app.js
```

Add the following code:

```javascript
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
```

> **Warning:** This application is intentionally vulnerable and should only be run in a local testing environment.

---

# 4. Run the Application

Start the server:

```bash
node app.js
```

Expected output:

```text
Server running at http://localhost:3000
```

Open the application:

```text
http://localhost:3000
```

---

# 5. Normal Input Test

Enter:

```text
Jothi
```

Or open:

```text
http://localhost:3000/?name=Jothi
```

The application displays:

```text
Hello Jothi
```

The server receives the `name` parameter and directly places it into the HTML response.

---

# 6. Identify the Vulnerability

The vulnerable code is:

```javascript
const name = req.query.name || "";

res.send(`
    <h1>XSS Demo</h1>
    <h2>Hello ${name}</h2>
`);
```

The application directly inserts user-controlled input into an HTML page.

The flow is:

```text
User Input
    ↓
HTTP Request
    ↓
Node.js / Express
    ↓
Input inserted directly into HTML
    ↓
Browser interprets HTML/JavaScript
```

Because the input is not properly escaped, an attacker can inject HTML or JavaScript.

---

# 7. XSS Demonstration

For this local demonstration, use the following harmless payload:

```html
<script>alert('XSS')</script>
```

The URL-encoded version is:

```text
http://localhost:3000/?name=%3Cscript%3Ealert(%27XSS%27)%3C%2Fscript%3E
```

Open the URL in the browser.

The browser executes the injected JavaScript and displays an alert:

```text
XSS
```

This demonstrates that the application is vulnerable to **Cross-Site Scripting**.

---

# 8. Why Does XSS Occur?

The application takes the following input:

```text
<script>alert('XSS')</script>
```

and inserts it directly into:

```html
<h2>Hello USER_INPUT</h2>
```

The resulting HTML becomes:

```html
<h2>Hello <script>alert('XSS')</script></h2>
```

The browser interprets the `<script>` element as executable JavaScript.

The problem can therefore be represented as:

```text
Untrusted Input
      ↓
No Output Encoding
      ↓
HTML Response
      ↓
Browser
      ↓
Injected JavaScript Executes
```

---

# 9. Security Fix

User input should be properly escaped before it is inserted into HTML.

Install the `escape-html` package:

```bash
npm install escape-html
```

Replace the vulnerable `app.js` with:

```javascript
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
```

---

# 10. Test the Fixed Application

Restart the server:

```bash
node app.js
```

Open the same test URL:

```text
http://localhost:3000/?name=%3Cscript%3Ealert(%27XSS%27)%3C%2Fscript%3E
```

The JavaScript should no longer execute.

Instead, the input is displayed as text.

The browser receives escaped HTML rather than executable `<script>` markup.

---

# 11. Vulnerable vs Secure

| Vulnerable Application              | Secure Application                 |
| ----------------------------------- | ---------------------------------- |
| Directly inserts user input         | Escapes user input                 |
| No output encoding                  | HTML output encoding               |
| Browser can interpret injected HTML | Injected HTML is displayed as text |
| XSS possible                        | XSS significantly reduced          |
| `${name}`                           | `${escapeHtml(name)}`              |

### Vulnerable

```javascript
const name = req.query.name;

res.send(`
    <h2>Hello ${name}</h2>
`);
```

### Secure

```javascript
const name = escapeHtml(req.query.name);

res.send(`
    <h2>Hello ${name}</h2>
`);
```

---

# 12. Security Countermeasures

## 1. Output Encoding

Escape untrusted data before inserting it into HTML.

```javascript
const name = escapeHtml(req.query.name);
```

## 2. Input Validation

Validate input according to the expected format.

For example, if the application expects a username, restrict it to an appropriate set of characters.

## 3. Use Safe DOM APIs

When developing browser-side JavaScript, prefer:

```javascript
element.textContent = userInput;
```

instead of:

```javascript
element.innerHTML = userInput;
```

when HTML is not required.

## 4. Content Security Policy

A suitable **Content Security Policy (CSP)** can provide an additional layer of protection against script injection.

For example:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'
```

CSP should be considered an additional security layer rather than a replacement for proper output encoding.

## 5. Avoid Trusting User Input

All data received from users should be considered untrusted until it has been appropriately validated and encoded for its output context.

---

# 13. Testing Summary

### Normal Input

```text
http://localhost:3000/?name=Jothi
```

Expected:

```text
Hello Jothi
```

### XSS Test

```text
http://localhost:3000/?name=%3Cscript%3Ealert(%27XSS%27)%3C%2Fscript%3E
```

### Vulnerable Version

```text
Injected JavaScript executes
```

### Fixed Version

```text
Injected JavaScript is displayed as text
```

---

# 14. Demonstration Flow

## Vulnerable Application

```text
User Input
    ↓
Node.js / Express
    ↓
Direct HTML Insertion
    ↓
Browser
    ↓
JavaScript Executes
```

## Secure Application

```text
User Input
    ↓
Node.js / Express
    ↓
HTML Escaping
    ↓
Safe HTML Response
    ↓
Browser
    ↓
Input displayed as text
```

---

# 15. Conclusion

This project demonstrates a basic **Cross-Site Scripting (XSS)** vulnerability in a Node.js and Express web application.

The vulnerability occurs because untrusted user input is directly inserted into an HTML response without proper output encoding.

The vulnerability can be mitigated by:

* Properly escaping output
* Validating user input
* Using safe DOM APIs such as `textContent`
* Implementing Content Security Policy as an additional defense
* Treating all user-controlled data as untrusted

The demonstration shows the difference between a vulnerable application and a secured application using a simple local Node.js environment.

> **Educational use only:** The vulnerable application is intentionally insecure and should only be run in a controlled local environment.
