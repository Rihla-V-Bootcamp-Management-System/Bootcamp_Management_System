import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] = useState(null);



  const fetchRegistrationSettings = async () => {
    try {
      const response = await apiClient.get(
        "/registration-settings"
      );

      setRegistrationOpen(
        response.data.registrationOpen
      );
    } catch (error) {
      console.error(
        "Failed to fetch registration settings:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load registration settings"
      );
    }
  };



  const fetchApplications = async () => {
    try {
      const response = await apiClient.get(
        "/registrations"
      );

      setApplications(
        response.data.registrations || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch applications:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load applications"
      );
    }
  };

  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchRegistrationSettings(),
        fetchApplications(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

 

  const toggleRegistration = async () => {
    try {
      setUpdating(true);
      setError("");

      const newStatus = !registrationOpen;

      const response = await apiClient.patch(
        "/registration-settings/toggle",
        {
          registrationOpen: newStatus,
        }
      );

      setRegistrationOpen(
        response.data.registrationOpen
      );
    } catch (error) {
      console.error(
        "Failed to update registration:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update registration"
      );
    } finally {
      setUpdating(false);
    }
  };

  

  const changeStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      setUpdating(true);
      setError("");

      const response = await apiClient.patch(
        `/registrations/${applicationId}/status`,
        {
          status: newStatus,
        }
      );

      const updatedRegistration =
        response.data.registration;

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application._id === applicationId
            ? updatedRegistration
            : application
        )
      );

      setSelectedApplication(
        updatedRegistration
      );
    } catch (error) {
      console.error(
        "Failed to update application status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update application status"
      );
    } finally {
      setUpdating(false);
    }
  };

  

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter(
          (application) =>
            application.status === filter
        );

 
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading applications...
        </p>
      </div>
    );
  }



  return (
    <div className="space-y-6">

     

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage bootcamp registration and review
          student applications.
        </p>
      </div>

      

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

   

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Registration
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control whether students can submit
              applications.
            </p>
          </div>

          <div className="flex items-center gap-4">

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                registrationOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {registrationOpen
                ? "Registration Open"
                : "Registration Closed"}
            </span>

            <button
              type="button"
              onClick={toggleRegistration}
              disabled={updating}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition ${
                registrationOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {updating
                ? "Updating..."
                : registrationOpen
                ? "Close Registration"
                : "Open Registration"}
            </button>

          </div>

        </div>

      </div>

   

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

        <SummaryCard
          title="Total"
          value={applications.length}
        />

        <SummaryCard
          title="Submitted"
          value={
            applications.filter(
              (app) =>
                app.status === "Submitted"
            ).length
          }
        />

        <SummaryCard
          title="Shortlisted"
          value={
            applications.filter(
              (app) =>
                app.status === "Shortlisted"
            ).length
          }
        />

        <SummaryCard
          title="Accepted"
          value={
            applications.filter(
              (app) =>
                app.status === "Accepted"
            ).length
          }
        />

        <SummaryCard
          title="Rejected"
          value={
            applications.filter(
              (app) =>
                app.status === "Rejected"
            ).length
          }
        />

      </div>

      {/* ======================================
          APPLICATIONS
      ====================================== */}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* FILTER */}

        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="font-semibold text-gray-900">
              Student Applications
            </h2>

            <p className="text-sm text-gray-500">
              {filteredApplications.length} application
              {filteredApplications.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All</option>
            <option value="Submitted">
              Submitted
            </option>
            <option value="Shortlisted">
              Shortlisted
            </option>
            <option value="Interviewed">
              Interviewed
            </option>
            <option value="Accepted">
              Accepted
            </option>
            <option value="Rejected">
              Rejected
            </option>
          </select>

        </div>

        {/* TABLE */}

        {filteredApplications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredApplications.map(
                  (application) => (
                    <tr
                      key={application._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-medium text-gray-900">
                          {application.fullName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {application.gender}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {application.email}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {application.batchId}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            application.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedApplication(
                              application
                            )
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================
          APPLICATION DETAILS MODAL
      ====================================== */}

      {selectedApplication && (
        <ApplicationDetails
          application={
            selectedApplication
          }
          onClose={() =>
            setSelectedApplication(null)
          }
          onChangeStatus={
            changeStatus
          }
          updating={updating}
        />
      )}

    </div>
  );
}

// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {
  const styles = {
    Submitted:
      "bg-gray-100 text-gray-700",

    Shortlisted:
      "bg-yellow-100 text-yellow-700",

    Interviewed:
      "bg-blue-100 text-blue-700",

    Accepted:
      "bg-green-100 text-green-700",

    Rejected:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

// ==========================================
// APPLICATION DETAILS
// ==========================================

function ApplicationDetails({
  application,
  onClose,
  onChangeStatus,
  updating,
}) {
  const possibleStatuses = {
    Submitted: ["Shortlisted", "Rejected"],

    Shortlisted: [
      "Interviewed",
      "Rejected",
    ],

    Interviewed: [
      "Accepted",
      "Rejected",
    ],

    Accepted: [],

    Rejected: [],
  };

  const nextStatuses =
    possibleStatuses[application.status] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Application Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {application.fullName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>

        </div>

        {/* CONTENT */}

        <div className="space-y-6 p-6">

          {/* BASIC INFORMATION */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Personal Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              <Info
                label="Full Name"
                value={
                  application.fullName
                }
              />

              <Info
                label="Email"
                value={
                  application.email
                }
              />

              <Info
                label="Phone"
                value={
                  application.phone
                }
              />

              <Info
                label="Gender"
                value={
                  application.gender
                }
              />

              <Info
                label="Batch"
                value={
                  application.batchId
                }
              />

              <Info
                label="Submitted"
                value={
                  application.submittedAt
                    ? new Date(
                        application.submittedAt
                      ).toLocaleString()
                    : "-"
                }
              />

            </div>

          </section>

          {/* STATUS */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Application Status
            </h3>

            <StatusBadge
              status={
                application.status
              }
            />

          </section>

          {/* DYNAMIC RESPONSES */}

          <section>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Application Responses
            </h3>

            {application.responses &&
            Object.keys(
              application.responses
            ).length > 0 ? (
              <div className="space-y-3">

                {Object.entries(
                  application.responses
                ).map(
                  ([key, value]) => (
                    <Info
                      key={key}
                      label={key}
                      value={
                        Array.isArray(
                          value
                        )
                          ? value.join(", ")
                          : String(
                              value ?? "-"
                            )
                      }
                    />
                  )
                )}

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No additional responses.
              </p>
            )}

          </section>

          {/* INTERVIEW NOTES */}

          {application.interviewNotes && (
            <section>

              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Interview Notes
              </h3>

              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                {
                  application.interviewNotes
                }
              </div>

            </section>
          )}

          {/* STATUS ACTIONS */}

          {nextStatuses.length > 0 && (
            <section className="border-t border-gray-200 pt-6">

              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Update Status
              </h3>

              <div className="flex flex-wrap gap-3">

                {nextStatuses.map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        onChangeStatus(
                          application._id,
                          status
                        )
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                        status ===
                        "Rejected"
                          ? "bg-red-600 hover:bg-red-700"
                          : status ===
                            "Accepted"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } disabled:opacity-50`}
                    >
                      {updating
                        ? "Updating..."
                        : `Mark as ${status}`}
                    </button>
                  )
                )}

              </div>

            </section>
          )}

        </div>

      </div>

    </div>
  );
}


function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">

      <p className="text-xs font-medium uppercase text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-gray-900">
        {value}
      </p>

    </div>
  );
}

export default Applications;