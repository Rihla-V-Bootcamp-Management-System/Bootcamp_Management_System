const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(
  __dirname,
  "../config/google-token.json"
);

const CREDENTIALS_PATH = path.join(
  __dirname,
  "../config/google-oauth-client.json"
);

// =====================================================
// CREATE OAUTH CLIENT
// =====================================================

const createOAuthClient = () => {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      "Google OAuth credentials file not found: " +
        CREDENTIALS_PATH
    );
  }

  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
  );

  const config =
    credentials.installed ||
    credentials.web;

  if (!config) {
    throw new Error(
      "Invalid Google OAuth credentials file."
    );
  }

return new google.auth.OAuth2(
  config.client_id,
  config.client_secret,
  "http://localhost:5001/oauth2callback"
);
};

// =====================================================
// GET AUTHENTICATED CLIENT
// =====================================================

const getAuthenticatedClient = () => {
  const oauth2Client = createOAuthClient();

  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error(
      "Google OAuth token not found. Run the OAuth authorization script first."
    );
  }

  const token = JSON.parse(
    fs.readFileSync(TOKEN_PATH, "utf8")
  );

  oauth2Client.setCredentials(token);

  return oauth2Client;
};

module.exports = {
  createOAuthClient,
  getAuthenticatedClient,
  TOKEN_PATH,
  CREDENTIALS_PATH,
};