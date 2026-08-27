import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";

function PublicApplication() {
  const [seasonId, setSeasonId] = useState("");
  const [season, setSeason] = useState(null);

  const [schema, setSchema] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD CURRENT SEASON
  // ==========================================

  useEffect(() => {
    const loadCurrentSeason = async () => {
      try {
        setLoading(true);
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

        if (!currentSeason.isOpen) {
          setError(
            "Registration is currently closed."
          );
          return;
        }

        setSeason(currentSeason);
        setSeasonId(currentSeason._id);
      } catch (error) {
        console.error(
          "Error loading current season:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load the current registration season."
        );
      }
    };

    loadCurrentSeason();
  }, []);

  // ==========================================
  // LOAD APPLICATION FORM
  // ==========================================

  useEffect(() => {
    if (!seasonId) {
      return;
    }

    const loadApplicationForm = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          `/application-forms/${seasonId}`
        );

        setSchema(response.data.fields || []);
      } catch (error) {
        console.error(
          "Error loading application form:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Application form is currently unavailable."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplicationForm();
  }, [seasonId]);

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

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
    } catch (error) {
      console.error(
        "Error submitting application:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit application. Please try again."
      );

      return false;
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading application form...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && schema.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">

          <p className="text-red-600 mb-4">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // ==========================================
  // APPLICATION FORM
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Bootcamp Application
        </h1>

        {season && (
          <p className="text-gray-600 mt-2">
            Applying for:{" "}
            <span className="font-medium">
              {season.name}
            </span>
          </p>
        )}

        <p className="text-gray-600 mt-2 mb-8">
          Complete the form below to apply for the
          bootcamp.
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {schema.length > 0 ? (
          <DynamicForm
            schema={schema}
            onSubmit={handleSubmit}
          />
        ) : (
          <p className="text-gray-500">
            No application fields have been configured yet.
          </p>
        )}

      </div>

    </div>
  );
}

export default PublicApplication;