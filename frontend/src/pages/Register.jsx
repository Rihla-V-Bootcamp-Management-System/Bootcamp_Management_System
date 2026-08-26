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
  // FETCH APPLICATION FORM
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
          "APPLICATION FORM RESPONSE:",
          JSON.stringify(response.data, null, 2)
        );

        const activeSeasonId =
          response.data?.season?._id ||
          response.data?.applicationForm?.seasonId;

        const fields =
          response.data?.applicationForm?.fields || [];

        if (!activeSeasonId) {
          setError(
            "There is currently no active registration season."
          );
          setSchema([]);
          return;
        }

        if (
          !Array.isArray(fields) ||
          fields.length === 0
        ) {
          setError(
            "The current application form has no questions configured."
          );
          setSchema([]);
          return;
        }

        setSeasonId(activeSeasonId);
        setSchema(fields);
      } catch (err) {
        console.error(
          "FAILED TO FETCH APPLICATION FORM:",
          err
        );

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

      console.log(
        "FORM RESPONSES JSON:",
        JSON.stringify(responses, null, 2)
      );

      console.log(
        "SEASON ID:",
        seasonId
      );

      // =================================================
      // CHECK SEASON
      // =================================================
      if (!seasonId) {
        setError(
          "Registration season was not found."
        );
        return false;
      }

      // =================================================
      // GET AVAILABLE PUBLIC BATCH
      // =================================================
      const batchResponse = await apiClient.get(
        "/batches/public"
      );

      console.log(
        "PUBLIC BATCH RESPONSE:",
        JSON.stringify(
          batchResponse.data,
          null,
          2
        )
      );

      const batches =
        batchResponse.data?.batches || [];

      if (
        !Array.isArray(batches) ||
        batches.length === 0
      ) {
        setError(
          "No batch is currently available for registration."
        );
        return false;
      }

      // Use the first available public batch
      const batchId = batches[0]?._id;

      if (!batchId) {
        setError(
          "The available batch does not have a valid ID."
        );
        return false;
      }

      console.log(
        "BATCH ID:",
        batchId
      );

      // =================================================
      // BUILD REGISTRATION PAYLOAD
      // =================================================
      const payload = {
        // Required root fields
        seasonId,
        batchId,

        fullName:
          responses.fullName || "",

        gender:
          responses.gender || "",

        email:
          responses.email || "",

        phoneNumber:
          responses.phoneNumber || "",

        telegramUsername:
          responses.telegramUsername || "",

        educationLevel:
          responses.educationLevel,

        educationInstitution:
          responses.educationInstitution || "",

        fieldOfStudy:
          responses.fieldOfStudy || "",

        studentId:
          responses.studentId || "",

        programmingExperience:
          responses.programmingExperience || "",

        githubLink:
          responses.githubLink || "",

        codeforcesLink:
          responses.codeforcesLink || "",

        leetcodeLink:
          responses.leetcodeLink || "",

        hoursPerWeek:
          responses.hoursPerWeek,

        canCommitFiveHoursPerDay:
          responses.canCommitFiveHoursPerDay,

        motivation:
          responses.motivation || "",

        // Keep age if it exists
        age:
          responses.age,

        // Store complete dynamic form response
        responses,
      };

      console.log(
        "REGISTRATION PAYLOAD JSON:",
        JSON.stringify(payload, null, 2)
      );

      // =================================================
      // SUBMIT REGISTRATION
      // =================================================
      const response = await apiClient.post(
        "/registrations",
        payload
      );

      console.log(
        "REGISTRATION SUCCESS:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      setSuccess(
        response.data?.message ||
          "Application submitted successfully!"
      );

      return true;
    } catch (err) {
      console.error(
        "REGISTRATION ERROR:",
        err
      );

      console.error(
        "BACKEND STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE JSON:",
        JSON.stringify(
          err.response?.data,
          null,
          2
        )
      );

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
          <Loader2
            size={32}
            className="mx-auto animate-spin text-gray-700"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading form questions...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // FORM LOAD ERROR
  // =====================================================
  if (error && schema.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Unable to load form
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
  // SUCCESS STATE
  // =====================================================
  if (success) {
    return (
      <div className="py-6">
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
  // FORM
  // =====================================================
  return (
    <div className="w-full">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Bootcamp Application
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Please complete the application form below with
          your correct details.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* DYNAMIC FORM */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>

      {/* FIRST LOGIN */}
      <div className="mt-8 border-t border-gray-200 pt-6 text-center">
        <p className="text-sm text-gray-500">
          Already accepted?
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Have your User ID and OTP?
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/first-login")
          }
          className="mt-3 text-sm font-semibold text-gray-800 transition hover:text-gray-600"
        >
          First-time login
        </button>
      </div>
    </div>
  );
}

export default Register;