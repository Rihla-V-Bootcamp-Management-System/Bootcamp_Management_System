import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";

function Register() {
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  
  const seasonId = "PUT_REAL_2026_SEASON_ID_HERE";

  useEffect(() => {
    const fetchApplicationForm = async () => {
      try {
        const response = await apiClient.get(
          `/application-forms/${seasonId}`
        );

        setSchema(response.data.fields || []);
      } catch (error) {
        console.error("Failed to fetch form:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load application form"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationForm();
  }, [seasonId]);

  const handleSubmit = async (responses) => {
    try {
      setError("");
      setSuccess("");

      /*
        The dynamic form should contain these
        fixed registration fields:

        fullName
        email
        phone
        batchId

        Everything else belongs inside responses.
      */

      const { fullName, email, phone, batchId, ...dynamicResponses } =
        responses;

      const registrationData = {
        seasonId,
        fullName,
        email,
        phone,
        batchId,
        responses: dynamicResponses,
      };

      console.log("Sending registration:", registrationData);

      const response = await apiClient.post(
        "/registrations",
        registrationData
      );

      console.log(
        "Registration successful:",
        response.data
      );

      setSuccess(
        "Application submitted successfully!"
      );

      return true;
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );

      return false;
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading application form...
      </div>
    );
  }

  if (error && schema.length === 0) {
    return (
      <div className="py-10 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold">
        Bootcamp Application
      </h1>

      <p className="mt-4 text-gray-600">
        Please complete the application form below.
      </p>

      {success && (
        <div className="mt-6 rounded-lg bg-green-100 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
        />
      </div>

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
          className="mt-3 font-medium text-blue-600 hover:text-blue-700"
        >
          First-time login
        </button>
      </div>
    </div>
  );
}

export default Register;