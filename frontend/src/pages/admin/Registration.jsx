
import React from "react";

function Registration() {
  return (
    <div className="space-y-8">

      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Registration Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage the registration period and registration form.
        </p>
      </div>

    
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Control when students can register for the bootcamp.
            </p>
          </div>

          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
            Not Configured
          </span>

        </div>
      </div>

      
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Registration Period
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Set the date and time when registration opens and closes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Opens
            </label>

            <input
              type="datetime-local"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Closes
            </label>

            <input
              type="datetime-local"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-[#071629] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#10233b]"
          >
            Save Registration Period
          </button>
        </div>

      </div>

     
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration Form
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage the fields used by the student registration form.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit Registration Form
          </button>

        </div>

       
        <div className="mt-6 rounded-lg bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            The registration form will be connected after the team integration.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Registration;