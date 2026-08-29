import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import apiClient from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

const DEFAULT_APPLICATION_SCHEMA = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "+251 912 345 678",
  },
  {
    id: "telegramUsername",
    label: "Telegram Username",
    type: "text",
    required: true,
    placeholder: "@username",
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    required: true,
    options: ["Male", "Female"],
  },
  {
    id: "educationLevel",
    label: "Education Level / Year",
    type: "select",
    required: true,
    options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"],
  },
  {
    id: "educationInstitution",
    label: "University / Institution",
    type: "text",
    required: true,
    placeholder: "e.g. Adama Science and Technology University",
  },
  {
    id: "fieldOfStudy",
    label: "Field of Study",
    type: "text",
    required: true,
    placeholder: "e.g. Software Engineering / Computer Science",
  },
  {
    id: "programmingExperience",
    label: "Programming Experience Level",
    type: "select",
    required: true,
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "githubLink",
    label: "GitHub Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://github.com/your-username",
  },
  {
    id: "codeforcesLink",
    label: "Codeforces Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://codeforces.com/profile/username",
  },
  {
    id: "motivation",
    label: "Why do you want to join this bootcamp?",
    type: "textarea",
    required: false,
    placeholder: "Tell us about your goals and motivations...",
  },
];

function Register() {
  const [seasonId, setSeasonId] = useState("");
  const [schema, setSchema] = useState(DEFAULT_APPLICATION_SCHEMA);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [registrationOpen, setRegistrationOpen] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrationStatusAndForm = async () => {
      try {
        setLoading(true);
        setError("");

        try {
          const settingsResponse = await apiClient.get(
            "/registration-settings"
          );

          const settings = settingsResponse.data;

          if (settings && settings.registrationOpen === false) {
            setRegistrationOpen(false);
            setError("Application is currently closed.");
            return;
          }
        } catch {
          // If settings endpoint is unreachable, allow registration by default
          setRegistrationOpen(true);
        }

        setRegistrationOpen(true);

        try {
          const response = await apiClient.get(
            "/application-forms"
          );

          const activeSeasonId =
            response.data?.season?._id ||
            response.data?.applicationForm?.seasonId;

          const fields =
            response.data?.applicationForm?.fields || [];

          if (activeSeasonId) {
            setSeasonId(activeSeasonId);
          }

          const coreIds = new Set(DEFAULT_APPLICATION_SCHEMA.map((f) => f.id));
          const customMap = new Map();
          if (Array.isArray(fields)) {
            fields.forEach((f) => {
              const key = f.id || f._id;
              if (key) customMap.set(key, f);
            });
          }


          const baseSchema = DEFAULT_APPLICATION_SCHEMA.map((coreField) => {
            return customMap.get(coreField.id) || coreField;
          });

          const customOnly = (Array.isArray(fields) ? fields : []).filter(
            (f) => f && (f.id || f._id) && !coreIds.has(f.id || f._id)
          );

          setSchema([...baseSchema, ...customOnly]);
        } catch {
          setSchema(DEFAULT_APPLICATION_SCHEMA);
        }
      } catch (err) {
        console.error(
          "FAILED TO FETCH REGISTRATION STATUS OR APPLICATION FORM:",
          err
        );
        setSchema(DEFAULT_APPLICATION_SCHEMA);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationStatusAndForm();
  }, []);

  const handleSubmit = async (responses) => {
    if (submitting) return false;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      let activeBatchId = "";
      try {
        const batchResponse = await apiClient.get(
          "/batches/public"
        );
        const batches =
          batchResponse.data?.batches || [];
        if (Array.isArray(batches) && batches.length > 0) {
          activeBatchId = batches[0]?._id;
        }
      } catch {
        // Fallback handled by backend
      }

      const payload = {
        seasonId: seasonId || undefined,
        batchId: activeBatchId || undefined,

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

        age:
          responses.age,

        responses,
      };

      const response = await apiClient.post(
        "/registrations",
        payload
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

      // Show the actual backend validation errors
      const validationErrors =
        err.response?.data?.errors;

      const message =
        Array.isArray(validationErrors) &&
          validationErrors.length > 0
          ? validationErrors.join(", ")
          : err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please check your information and try again.";

      setError(message);

      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-gray-700"
          />

          <p className="mt-4 text-sm text-gray-500">
            Checking application status...
          </p>
        </div>
      </div>
    );
  }

  if (!registrationOpen) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <h1 className="text-2xl font-bold text-gray-900">
            Application is currently closed
          </h1>


          <p className="mt-3 text-sm leading-6 text-gray-600">
            Registration is not available at the moment.
            Please check back when the application period
            opens.
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



        </div>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Bootcamp Application
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Please complete the application form below with
          your correct details.
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