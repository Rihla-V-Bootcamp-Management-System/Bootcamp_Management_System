import { ArrowLeft, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function StudentWebProgress() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-slate-50 dark:bg-[#070e1b]">
      <div className="w-full px-4 pb-8 pt-4 sm:px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/student/progress")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900 dark:text-white"
          >
            <ArrowLeft size={16} />
            Back to Progress
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#e5f1ed] p-3">
              <Code2 className="h-6 w-6 text-[#1f6f5b]" />
            </div>

            
          </div>
        </div>

        {/* EMPTY STATE */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center shadow-sm">
          <Code2 className="mx-auto h-10 w-10 text-gray-300" />

          <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
            No progress available yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
            Your web development topics and statuses will appear
            here when progress data is available.
          </p>
        </div>

      </div>
    </div>
  );
}

export default StudentWebProgress;