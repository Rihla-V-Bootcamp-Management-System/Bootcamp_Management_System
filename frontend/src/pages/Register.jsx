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

  useEffect(() => {
    const fetchApplicationForm = async () => {
      try {
        const response = await apiClient.get(
          "/application-forms"
        );

        setSchema(response.data.fields || []);
      } catch (error) {
        console.error(
          "Failed to fetch application form:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load application form"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationForm();
  }, []);

  const handleSubmit = async (responses) => {
    try {
      setError("");
      setSuccess("");

      const registrationData = {
        ...responses,
      };

      console.log(
        "Sending registration:",
        registrationData
      );

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
      console.error(
        "Registration failed:",
        error
      );

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

  
  if (error && schema.length === 0 && registrationOpen) {
    return (
      <div className="py-10 text-center text-red-600">
        {error}
      </div>
    );
  }

 
  if (!registrationOpen) {
    return (
      <div className="w-full py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Registration is Closed
        </h1>

        <p className="mt-4 text-gray-600">
          The bootcamp application period is currently
          closed.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please check back when registration opens.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Back to Home
        </button>
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

      {/* ==============================
          SUCCESS MESSAGE
      ============================== */}

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

      {/* ==============================
          FIRST LOGIN
      ============================== */}

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
