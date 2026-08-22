import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

function Register() {
  const [seasonId, setSeasonId] = useState("");
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // FETCH APPLICATION FORM SCHEMA
  // =====================================================
  useEffect(() => {
    const fetchApplicationForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/application-forms");

        // Extract seasonId and dynamic schema fields safely
        const activeSeasonId =
          response.data?.season?._id ||
          response.data?.applicationForm?.seasonId;

        const fields = response.data?.applicationForm?.fields || [];

        if (!activeSeasonId) {
          setError("There is currently no active registration season.");
          setSchema([]);
          return;
        }

        if (!Array.isArray(fields) || fields.length === 0) {
          setError("The current application form has no questions configured.");
          setSchema([]);
          return;
        }

        setSeasonId(activeSeasonId);
        setSchema(fields);
      } catch (err) {
        console.error("Failed to fetch application form:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load application form. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationForm();
  }, []);

  // =====================================================
  // SUBMIT APPLICATION
  // =====================================================
  const handleSubmit = async (responses) => {
    if (submitting) return false;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      // Map root metadata expected by backend schema
      const fullName =
        responses.fullName || responses.name || "Bootcamp Applicant";
      const email = responses.email || responses.emailAddress || "";
      const phoneNumber = responses.phoneNumber || responses.phone || "";

      const payload = {
        seasonId,
        fullName,
        email,
        phoneNumber,
        responses,
      };

      const response = await apiClient.post("/registrations", payload);

      setSuccess(
        response.data?.message || "Application submitted successfully!"
      );
      return true;
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your information and try again.";

      setError(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-gray-700" />
          <p className="mt-4 text-sm text-gray-500">Loading form questions...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================
  if (error && schema.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Unable to load form
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // SUCCESS STATE
  // =====================================================
  if (success) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={30} className="text-green-600" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Application Submitted
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{success}</p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait for the bootcamp team to review your application.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM RENDER
  // =====================================================
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Bootcamp Application
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Please complete the application form below with your correct details.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">Already accepted?</p>
        <p className="mt-1 text-sm text-gray-500">Have your User ID and OTP?</p>
        <button
          type="button"
          onClick={() => navigate("/first-login")}
          className="mt-3 text-sm font-semibold text-gray-800 transition hover:text-gray-600"
        >
          First-time login
        </button>
      </div>
    </div>
  );
}

export default Register;