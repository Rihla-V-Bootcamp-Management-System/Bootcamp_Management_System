import DynamicForm from "../components/DynamicForm";

const mockSchema = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    options: [],
  },
  {
    id: "email",
    label: "Email",
    type: "text",
    required: true,
    options: [],
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "text",
    required: true,
    options: [],
  },
  {
    id: "age",
    label: "Age",
    type: "number",
    required: true,
    options: [],
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    required: true,
    options: ["Male", "Female"],
  },
  {
    id: "motivation",
    label: "Why do you want to join?",
    type: "textarea",
    required: true,
    options: [],
  },
];

function Register({ onLogin }) {
  const handleSubmit = (responses) => {
    console.log("Application submitted:", responses);
  };

  return (
    <div className="min-h-screen w-full">
      <h1 className="text-3xl font-bold">
        Bootcamp Application
      </h1>

      <p className="mt-4 text-gray-600">
        Please complete the application form below.
      </p>

      <div className="mt-8">
        <DynamicForm
          schema={mockSchema}
          onSubmit={handleSubmit}
        />
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?
      </p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-2 text-blue-600 hover:underline"
      >
        Login
      </button>
    </div>
  );
}

export default Register;