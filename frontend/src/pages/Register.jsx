import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

function Register() {
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // =====================================================
  // GET APPLICATION FORM
  // =====================================================

  useEffect(() => {
    const fetchApplicationForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          "/application-forms"
        );

        console.log(
          "APPLICATION FORM:",
          response.data
        );

        setSchema(response.data?.fields || []);

      } catch (error) {
        console.error(
          "Failed to fetch application form:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load application form. Please try again."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchApplicationForm();
  }, []);

  // =====================================================
  // SUBMIT REGISTRATION
  // =====================================================

  const handleSubmit = async (responses) => {
    if (submitting) {
      return false;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const registrationData = {
        ...responses,
      };

      console.log(
        "SENDING REGISTRATION:",
        registrationData
      );

      const response = await apiClient.post(
        "/registrations",
        registrationData
      );

      console.log(
        "REGISTRATION SUCCESS:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Application submitted successfully!"
      );

      return true;

    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please check your information and try again.";

      setError(message);

      return false;

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={32}
            className="mx-auto animate-spin text-gray-700"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading application form...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // FORM FAILED TO LOAD
  // =====================================================

  if (error && schema.length === 0) {
    return (
      <div className="py-12 text-center">

        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6">

          <h2 className="font-semibold text-red-800">
            Unable to load application form
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

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
  // SUCCESS
  // =====================================================

  if (success) {
    return (
      <div className="py-12">

        <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">

            <CheckCircle2
              size={30}
              className="text-green-600"
            />

          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Application Submitted
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            {success}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Please wait for the bootcamp team to review
            your application.
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
  // REGISTRATION PAGE
  // =====================================================

  return (
    <div className="w-full">

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Bootcamp Application
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Please complete the application form below
          with your correct information.
        </p>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ================= FORM ================= */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
          submitting={submitting}
        />

      </div>

      {/* ================= FIRST LOGIN ================= */}

      <div className="mt-8 border-t border-gray-200 pt-6 text-center">

        <p className="text-sm text-gray-500">
          Already accepted?
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Have your User ID and OTP?
        </p>

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