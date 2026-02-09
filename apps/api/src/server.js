/**
 * Intentionally vulnerable demo server.
 * DO NOT DEPLOY. Local testing only.
 */
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const _ = require("lodash");                 // pinned to a known-vulnerable version (demo)
const minimist = require("minimist");        // pinned to a known-vulnerable version (demo)
const Handlebars = require("handlebars");    // pinned to a known-vulnerable version (demo)
const serialize = require("serialize-javascript"); // pinned to a known-vulnerable version (demo)

const { getOpenClawVersion } = require("./openclaw-client");
const copyleft = require("copyleft-lib");

const app = express();
app.use(bodyParser.json());

// --- Intentional "secrets in code" demo ---
const OPENCLAW_API_KEY = "hardcoded-demo-key-DO-NOT-USE";

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "OpenClaw Insecure Demo API",
    openclawVersion: getOpenClawVersion(),
    copyleftLib: copyleft.about()
  });
});

// --- Insecure: command execution with user-controlled input ---
// Example: /run?cmd=ls
app.get("/run", (req, res) => {
  const args = minimist(process.argv.slice(2)); // intentionally unused but present for scanning
  const cmd = String(req.query.cmd || "echo missing_cmd");
  exec(cmd, (err, stdout, stderr) => {
    res.type("text/plain").send(
      (err ? ("ERR: " + err.message + "\n") : "") +
      "STDOUT:\n" + stdout + "\nSTDERR:\n" + stderr
    );
  });
});

// --- Insecure: path traversal / arbitrary file read ---
// Example: /read?path=../../../../etc/hosts
app.get("/read", (req, res) => {
  const p = String(req.query.path || "");
  const baseDir = path.join(__dirname, ".."); // apps/api
  const target = path.join(baseDir, p);       // no normalization / allowlist on purpose
  fs.readFile(target, "utf8", (err, data) => {
    if (err) return res.status(404).json({ error: err.message, target });
    res.type("text/plain").send(data);
  });
});

// --- Insecure: prototype pollution-ish merge ---
// Attackers can attempt to smuggle __proto__ / constructor keys.
app.post("/merge", (req, res) => {
  const obj = {};
  _.merge(obj, req.body); // intentionally unsafe merge of untrusted input
  res.json({ merged: obj, note: "unsafe merge completed" });
});

// --- Insecure: unsafe template compilation options ---
// Posting an attacker-controlled template string can lead to RCE-like behavior in some configurations.
app.post("/render", (req, res) => {
  const templateStr = String(req.body && req.body.template || "Hello {{name}}");
  const data = (req.body && req.body.data) || { name: "world" };

  // Intentionally unsafe Handlebars config for demo
  const template = Handlebars.compile(templateStr, {
    // these options are commonly discouraged with untrusted templates
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true
  });

  const out = template(data);

  // Also intentionally unsafe serialization usage for XSS-style findings
  const serialized = serialize({ out }, { unsafe: true });

  res.type("text/html").send(
    "<h1>Rendered</h1><pre>" + out + "</pre>" +
    "<h2>Serialized</h2><pre>" + serialized + "</pre>"
  );
});

// --- Insecure: information disclosure ---
app.get("/debug/env", (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    openclawApiKey: process.env.OPENCLAW_API_KEY || OPENCLAW_API_KEY,
    env: process.env
  });
});

const port = 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Demo API listening on http://localhost:${port}`);
});
