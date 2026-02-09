// This file exists so tooling can discover OpenClaw usage in code.
// The API surface of `openclaw` may change; we keep usage minimal.
const openclaw = require("openclaw");

function getOpenClawVersion() {
  // Many npm packages expose version via package.json; this is intentionally simple.
  try {
    // eslint-disable-next-line import/no-dynamic-require
    const pkg = require("openclaw/package.json");
    return pkg.version;
  } catch (e) {
    return "unknown";
  }
}

module.exports = { openclaw, getOpenClawVersion };
