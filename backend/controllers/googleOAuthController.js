const {
  getAuthorizationUrl,
  getTokensFromCode,
} = require("../services/googleOAuthService");

// =========================================================
// START GOOGLE OAUTH
// =========================================================

const startGoogleOAuth = async (req, res) => {
  try {
    const url = getAuthorizationUrl();

    return res.redirect(url);
  } catch (error) {
    console.error(
      "GOOGLE OAUTH START ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to start Google OAuth",
    });
  }
};

// =========================================================
// GOOGLE OAUTH CALLBACK
// =========================================================

const googleOAuthCallback = async (
  req,
  res
) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Google authorization failed: ${error}`,
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "Authorization code was not provided.",
      });
    }

    const tokens =
      await getTokensFromCode(code);

    console.log(
      "=========================================="
    );
    console.log("GOOGLE OAUTH SUCCESS");
    console.log(
      "=========================================="
    );

    console.log("Access token received:", !!tokens.access_token);
    console.log("Refresh token received:", !!tokens.refresh_token);

    console.log(
      "=========================================="
    );

    // IMPORTANT:
    // We will store the refresh token properly
    // after confirming OAuth works.
    //
    // For this first test, we only display success.

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Success</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f7fb;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }

            .card {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }

            h1 {
              color: #16a34a;
            }

            p {
              color: #555;
              line-height: 1.6;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>✓ Google OAuth Successful</h1>

            <p>
              Your Google account has successfully
              authorized the Bootcamp Attendance System.
            </p>

            <p>
              The backend received the Google
              authorization tokens.
            </p>

            <p>
              You can close this window.
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(
      "GOOGLE OAUTH CALLBACK ERROR:",
      error.response?.data ||
        error.message ||
        error
    );

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.error_description ||
        error.message ||
        "Google OAuth failed",
    });
  }
};

module.exports = {
  startGoogleOAuth,
  googleOAuthCallback,
};