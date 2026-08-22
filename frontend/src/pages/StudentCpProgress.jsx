import { ArrowLeft, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

function StudentCPProgress() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 pb-8 pt-4 sm:px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/student/progress")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Progress
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-3">
              <Terminal className="h-6 w-6 text-purple-600" />
            </div>

           
          </div>
        </div>

        {/* EMPTY STATE */}
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Terminal className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 font-semibold text-gray-900">
            No problems available yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Competitive programming questions will appear here
            when they are assigned.
          </p>
        </div>

      </div>
    </div>
  );
}

export default StudentCPProgress;