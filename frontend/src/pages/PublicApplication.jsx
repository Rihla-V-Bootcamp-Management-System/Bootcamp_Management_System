
import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";

function PublicApplication() {
  const [seasonId, setSeasonId] = useState("");
  const [season, setSeason] = useState(null);
  const [schema, setSchema] = useState([]);

  const [loadingSeason, setLoadingSeason] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD CURRENT SEASON
  // =========================================================

  useEffect(() => {
    const loadCurrentSeason = async () => {
      try {
        setLoadingSeason(true);
        setError("");

        const response = await apiClient.get(
          "/seasons/current"
        );

        const currentSeason = response.data;

        if (!currentSeason?._id) {
          setError(
            "There is currently no registration season."
          );
          return;
        }

        // -----------------------------------------------------
        // SUPER ADMIN CONTROLS THIS
        // -----------------------------------------------------

        if (!currentSeason.isOpen) {
          setError(
            "Registration is currently closed."
          );
          return;
        }

        setSeason(currentSeason);
        setSeasonId(currentSeason._id);

      } catch (err) {
        console.error(
          "LOAD CURRENT SEASON ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load the current registration season."
        );
      } finally {
        setLoadingSeason(false);
      }
    };

    loadCurrentSeason();
  }, []);

  // =========================================================
  // LOAD APPLICATION FORM FOR CURRENT SEASON
  // =========================================================

  useEffect(() => {
    if (!seasonId) return;

    const loadApplicationForm = async () => {
      try {
        setLoadingForm(true);
        setError("");

        const response = await apiClient.get(
          `/application-forms/${seasonId}`
        );

        setSchema(
          Array.isArray(response.data?.fields)
            ? response.data.fields
            : []
        );

      } catch (err) {
        console.error(
          "LOAD APPLICATION FORM ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Application form is currently unavailable."
        );
      } finally {
        setLoadingForm(false);
      }
    };

    loadApplicationForm();
  }, [seasonId]);

  // =========================================================
  // SUBMIT APPLICATION
  // =========================================================

  const handleSubmit = async (responses) => {
    try {
      setError("");
      setSuccess("");

      await apiClient.post("/registrations", {
        seasonId,
        responses,
      });

      setSuccess(
        "Your application has been submitted successfully!"
      );

      return true;

    } catch (err) {
      console.error(
        "SUBMIT APPLICATION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again."
      );

      return false;
    }
  };

  // =========================================================
  // LOADING SEASON
  // =========================================================

  if (loadingSeason) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="text-center">

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="text-sm text-gray-600">
            Checking registration availability...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // REGISTRATION CLOSED / ERROR
  // =========================================================

  if (error && !seasonId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-lg">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

            <span className="text-2xl">
              !
            </span>

          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Registration Unavailable
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-lg bg-[#071629] px-6 py-3 text-sm font-medium text-white hover:bg-[#10233b]"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // LOADING FORM
  // =========================================================

  if (loadingForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <p className="text-sm text-gray-600">
          Loading application form...
        </p>

      </div>
    );
  }

  // =========================================================
  // APPLICATION FORM
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">

      <div className="mx-auto max-w-2xl">

        <div className="rounded-xl bg-white p-8 shadow-lg">

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              Bootcamp Application
            </h1>

            {season?.name && (
              <p className="mt-2 text-gray-600">
                Applying for:
                {" "}
                <span className="font-semibold text-gray-900">
                  {season.name}
                </span>
              </p>
            )}

            <p className="mt-3 text-gray-600">
              Complete the form below to apply for the
              bootcamp.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================== */}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* =================================================
              FORM
          ================================================== */}

          {schema.length > 0 ? (

            <DynamicForm
              schema={schema}
              onSubmit={handleSubmit}
            />

          ) : (

            <div className="rounded-lg bg-gray-50 p-6 text-center">

              <p className="text-sm text-gray-500">
                The application form has not been configured
                yet.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default PublicApplication;

