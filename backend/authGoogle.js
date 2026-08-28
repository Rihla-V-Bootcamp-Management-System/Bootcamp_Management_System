require("dotenv").config();

const express = require("express");
const {
  createOAuthClient,
  TOKEN_PATH,
} = require("./services/googleOAuth");

const fs = require("fs");

const app = express();
const PORT = 5001;

const SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly",
];

const client = createOAuthClient();

// =====================================================
// START GOOGLE AUTHORIZATION
// =====================================================

const authUrl = client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("");
console.log("========================================");
console.log("GOOGLE OAUTH AUTHORIZATION");
console.log("========================================");
console.log("");
console.log("Open this URL in your browser:");
console.log("");
console.log(authUrl);
console.log("");
console.log("========================================");
console.log("");
console.log(`Waiting for Google callback on port ${PORT}...`);
console.log("");

// =====================================================
// GOOGLE CALLBACK
// =====================================================

app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Authorization code missing.");
    }

    console.log("Google authorization code received.");

    const { tokens } = await client.getToken(code);

    client.setCredentials(tokens);

    fs.writeFileSync(
      TOKEN_PATH,
      JSON.stringify(tokens, null, 2)
    );

    console.log("");
    console.log("========================================");
    console.log("GOOGLE OAUTH SUCCESS");
    console.log("========================================");
    console.log("Token saved to:");
    console.log(TOKEN_PATH);
    console.log("========================================");
    console.log("");

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: #f5f7fa;
            }

            .box {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              text-align: center;
            }

            h1 {
              color: #16a34a;
            }
          </style>
        </head>

        <body>
          <div class="box">
            <h1>✓ Google OAuth Successful</h1>

            <p>
              Your Google account has successfully authorized
              the Bootcamp Attendance System.
            </p>

            <p>
              The backend received the Google authorization tokens.
            </p>

            <p>
              You can close this window.
            </p>
          </div>
        </body>
      </html>
    `);

    // Stop server after successful authorization
    setTimeout(() => {
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("GOOGLE OAUTH FAILED");
    console.error("========================================");
    console.error(error.message);
    console.error(error.response?.data || "");
    console.error("");

    res.status(500).send(`
      <h1>Google OAuth Failed</h1>
      <p>${error.message}</p>
    `);
  }
});

// =====================================================
// START AUTH SERVER
// =====================================================

app.listen(PORT, () => {
  console.log(`OAuth callback server running on:`);
  console.log(`http://localhost:${PORT}/oauth2callback`);
});