import React, { useState } from "react";

function Applications() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Ahmed Mohammed",
      email: "ahmed@gmail.com",
      phone: "0912345678",
      status: "Pending",
      interview: "Not Interviewed",
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara@gmail.com",
      phone: "0923456789",
      status: "Shortlisted",
      interview: "Passed",
    },
    {
      id: 3,
      name: "Yusuf Hassan",
      email: "yusuf@gmail.com",
      phone: "0934567890",
      status: "Rejected",
      interview: "Failed",
    },
  ]);

  const updateStatus = (id, status) => {
    setApplications((current) =>
      current.map((application) =>
        application.id === id
          ? { ...application, status }
          : application
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review and manage student registration applications.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Applications
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {applications.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {
              applications.filter(
                (application) => application.status === "Pending"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Shortlisted
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {
              applications.filter(
                (application) => application.status === "Shortlisted"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Rejected
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {
              applications.filter(
                (application) => application.status === "Rejected"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Student Applications
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Student
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Phone
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Interview
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">

              {applications.map((application) => (

                <tr
                  key={application.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4">

                    <p className="font-medium text-slate-900">
                      {application.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {application.email}
                    </p>

                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {application.phone}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        application.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : application.status === "Shortlisted"
                          ? "bg-blue-100 text-blue-700"
                          : application.status === "Accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {application.status}
                    </span>

                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {application.interview}
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex flex-wrap gap-2">

                      <button
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>

                      {application.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "Shortlisted"
                              )
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Shortlist
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "Rejected"
                              )
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {application.status === "Shortlisted" &&
                        application.interview === "Passed" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                application.id,
                                "Accepted"
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                        )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Applications;