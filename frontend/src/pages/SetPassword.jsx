import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function SetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userID = searchParams.get("userID") || "";
  const otp = searchParams.get("otp") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!userID || !otp) {
      setError(
        "This invitation link is missing your User ID or OTP."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const verifyResponse = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID,
            otp,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(
          verifyData.message ||
            "Invitation verification failed."
        );
      }

      const passwordResponse = await fetch(
        "http://localhost:5000/api/auth/set-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID,
            otp,
            newPassword,
          }),
        }
      );

      const passwordData = await passwordResponse.json();

      if (!passwordResponse.ok) {
        throw new Error(
          passwordData.message ||
            "Failed to set password."
        );
      }

      localStorage.setItem(
        "token",
        passwordData.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(passwordData.user)
      );

      setMessage(
        "Password created successfully. Redirecting..."
      );

      setTimeout(() => {
        if (passwordData.user.role === "superadmin") {
          navigate("/superadmin");
        } else {
          navigate("/login");
        }
      }, 1200);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f8f9fc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>
          Set Your Password
        </h1>

        <p
          style={{
            marginBottom: "24px",
            color: "#666",
            lineHeight: "1.6",
          }}
        >
          Create your password to activate your
          Bootcamp Management System account.
        </p>

        {!userID || !otp ? (
          <div
            style={{
              padding: "14px",
              borderRadius: "8px",
              background: "#fff3f3",
              color: "#c0392b",
              marginBottom: "20px",
            }}
          >
            This invitation link is incomplete.
            Please open the Set Your Password button
            from your invitation email.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              User ID
            </label>

            <input
              type="text"
              value={userID}
              readOnly
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "18px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#f5f5f5",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              OTP
            </label>

            <input
              type="text"
              value={otp}
              readOnly
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "18px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#f5f5f5",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="At least 8 characters"
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "18px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Repeat your password"
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "18px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />

            {error && (
              <p
                style={{
                  color: "#c0392b",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
            )}

            {message && (
              <p
                style={{
                  color: "#238b45",
                  marginBottom: "16px",
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "8px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "700",
              }}
            >
              {loading
                ? "Setting Password..."
                : "Set Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SetPassword;