const { google } = require("googleapis");

const getOAuth2Client = () => {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID is missing from .env"
    );
  }

  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_SECRET is missing from .env"
    );
  }

  if (!process.env.GOOGLE_OAUTH_REDIRECT_URI) {
    throw new Error(
      "GOOGLE_OAUTH_REDIRECT_URI is missing from .env"
    );
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
};

// =========================================================
// GOOGLE MEET SCOPES
// =========================================================

const getGoogleScopes = () => {
  return [
    "https://www.googleapis.com/auth/meetings.space.created",
    "https://www.googleapis.com/auth/meetings.space.readonly",
  ];
};

// =========================================================
// CREATE GOOGLE AUTHORIZATION URL
// =========================================================

const getAuthorizationUrl = (state = "") => {
  const oauth2Client = getOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: getGoogleScopes(),
    state,
  });
};

// =========================================================
// EXCHANGE AUTHORIZATION CODE FOR TOKENS
// =========================================================

const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuth2Client();

  const { tokens } =
    await oauth2Client.getToken(code);

  return tokens;
};

// =========================================================
// CREATE AUTH CLIENT FROM TOKENS
// =========================================================

const getAuthenticatedClient = (tokens) => {
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials(tokens);

  return oauth2Client;
};

module.exports = {
  getOAuth2Client,
  getGoogleScopes,
  getAuthorizationUrl,
  getTokensFromCode,
  getAuthenticatedClient,
};