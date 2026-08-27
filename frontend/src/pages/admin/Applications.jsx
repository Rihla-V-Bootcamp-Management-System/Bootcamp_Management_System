import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import EmailTemplates from "./EmailTemplates";

function Applications() {
  const [activeTab, setActiveTab] = useState("applications");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================
  const fetchApplications = async () => {
    try {
      const response = await apiClient.get("/registrations");

      console.log(
        "APPLICATIONS RESPONSE:",
        response.data
      );

      setApplications(
        Array.isArray(response.data?.registrations)
          ? response.data.registrations
          : []
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

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================
  useEffect(() => {
    if (activeTab !== "applications") {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      await fetchApplications();

      setLoading(false);
    };

    loadData();
  }, [activeTab]);

  // =====================================================
  // CHANGE APPLICATION STATUS
  // =====================================================
  const changeStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      setUpdating(true);
      setError("");

      console.log(
        "CHANGING STATUS:",
        applicationId,
        newStatus
      );

      const response = await apiClient.patch(
        `/registrations/${applicationId}/status`,
        {
          status: newStatus,
        }
      );

      console.log(
        "STATUS UPDATE RESPONSE:",
        response.data
      );

      const updatedRegistration =
        response.data?.registration;

      if (!updatedRegistration) {
        throw new Error(
          "Updated registration was not returned by the server."
        );
      }

      setApplications(
        (previousApplications) =>
          previousApplications.map(
            (application) =>
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

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update application status"
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // FILTER APPLICATIONS
  // =====================================================
  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter(
          (application) =>
            application.status === filter
        );

  // =====================================================
  // LOADING
  // =====================================================
  if (
    loading &&
    activeTab === "applications"
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading applications...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Applications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage bootcamp applications and
          registration email templates.
        </p>
      </div>

      {/* =================================================
          TABS
      ================================================= */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">

          <button
            type="button"
            onClick={() =>
              setActiveTab("applications")
            }
            className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              activeTab === "applications"
                ? "border-[#071629] text-[#071629]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Applications
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("email-templates")
            }
            className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              activeTab === "email-templates"
                ? "border-[#071629] text-[#071629]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Templates
          </button>

        </div>
      </div>

      {/* =================================================
          EMAIL TEMPLATES TAB
      ================================================= */}
      {activeTab === "email-templates" && (
        <EmailTemplates />
      )}

      {/* =================================================
          APPLICATIONS TAB
      ================================================= */}
      {activeTab === "applications" && (
        <>
          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}
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
                    app.status === "SUBMITTED"
                ).length
              }
            />

            <SummaryCard
              title="Shortlisted"
              value={
                applications.filter(
                  (app) =>
                    app.status === "SHORTLISTED"
                ).length
              }
            />

            <SummaryCard
              title="Accepted"
              value={
                applications.filter(
                  (app) =>
                    app.status === "ACCEPTED"
                ).length
              }
            />

            <SummaryCard
              title="Rejected"
              value={
                applications.filter(
                  (app) =>
                    app.status === "REJECTED"
                ).length
              }
            />

          </div>

          {/* =================================================
              APPLICATIONS TABLE
          ================================================= */}
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
                <option value="All">
                  All
                </option>

                <option value="SUBMITTED">
                  Submitted
                </option>

                <option value="SHORTLISTED">
                  Shortlisted
                </option>

                <option value="INTERVIEWED">
                  Interviewed
                </option>

                <option value="ACCEPTED">
                  Accepted
                </option>

                <option value="REJECTED">
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

                          {/* APPLICANT */}
                          <td className="px-5 py-4">

                            <p className="font-medium text-gray-900">
                              {application.fullName ||
                                "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {application.gender ||
                                "-"}
                            </p>

                          </td>

                          {/* EMAIL */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {application.email ||
                              "-"}
                          </td>

                          {/* BATCH */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {getBatchName(
                              application.batchId
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">

                            <StatusBadge
                              status={
                                application.status
                              }
                            />

                          </td>

                          {/* ACTION */}
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

          {/* =================================================
              APPLICATION DETAILS MODAL
          ================================================= */}
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
        </>
      )}

    </div>
  );
}

// =====================================================
// BATCH NAME HELPER
// =====================================================
function getBatchName(batch) {
  if (!batch) {
    return "-";
  }

  if (typeof batch === "string") {
    return batch;
  }

  if (typeof batch === "object") {
    return (
      batch.name ||
      batch.title ||
      batch._id ||
      "-"
    );
  }

  return String(batch);
}

// =====================================================
// SUMMARY CARD
// =====================================================
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

// =====================================================
// STATUS BADGE
// =====================================================
function StatusBadge({ status }) {
  const styles = {
    SUBMITTED:
      "bg-gray-100 text-gray-700",

    SHORTLISTED:
      "bg-yellow-100 text-yellow-700",

    INTERVIEWED:
      "bg-blue-100 text-blue-700",

    ACCEPTED:
      "bg-green-100 text-green-700",

    REJECTED:
      "bg-red-100 text-red-700",
  };

  const labels = {
    SUBMITTED: "Submitted",
    SHORTLISTED: "Shortlisted",
    INTERVIEWED: "Interviewed",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] ||
        status ||
        "-"}
    </span>
  );
}

// =====================================================
// APPLICATION DETAILS
// =====================================================
function ApplicationDetails({
  application,
  onClose,
  onChangeStatus,
  updating,
}) {
  const possibleStatuses = {
    SUBMITTED: [
      "SHORTLISTED",
      "REJECTED",
    ],

    SHORTLISTED: [
      "INTERVIEWED",
      "REJECTED",
    ],

    INTERVIEWED: [
      "ACCEPTED",
      "REJECTED",
    ],

    ACCEPTED: [],

    REJECTED: [],
  };

  const nextStatuses =
    possibleStatuses[
      application.status
    ] || [];

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
              {application.fullName ||
                "-"}
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

          {/* PERSONAL INFORMATION */}
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
                  application.phoneNumber
                }
              />

              <Info
                label="Gender"
                value={
                  application.gender
                }
              />

              <Info
                label="Telegram"
                value={
                  application.telegramUsername
                }
              />

              <Info
                label="Student ID"
                value={
                  application.studentId
                }
              />

              <Info
                label="Education Level"
                value={
                  application.educationLevel
                }
              />

              <Info
                label="Institution"
                value={
                  application.educationInstitution
                }
              />

              <Info
                label="Field of Study"
                value={
                  application.fieldOfStudy
                }
              />

              <Info
                label="Batch"
                value={getBatchName(
                  application.batchId
                )}
              />

              <Info
                label="Season"
                value={getObjectValue(
                  application.seasonId
                )}
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

          {/* PROGRAMMING INFORMATION */}
          <section>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Programming Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              <Info
                label="Programming Experience"
                value={
                  application.programmingExperience
                }
              />

              <Info
                label="Hours Per Week"
                value={
                  application.hoursPerWeek
                }
              />

              <Info
                label="5 Hours Per Day"
                value={
                  application.canCommitFiveHoursPerDay
                    ? "Yes"
                    : "No"
                }
              />

              <Info
                label="GitHub"
                value={
                  application.githubLink
                }
              />

              <Info
                label="Codeforces"
                value={
                  application.codeforcesLink
                }
              />

              <Info
                label="LeetCode"
                value={
                  application.leetcodeLink
                }
              />

            </div>
          </section>

          {/* MOTIVATION */}
          <section>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Motivation
            </h3>

            <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {application.motivation ||
                "-"}
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
            typeof application.responses ===
              "object" &&
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
                      value={formatValue(
                        value
                      )}
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

          {/* REJECTION REASON */}
          {application.rejectionReason && (
            <section>

              <h3 className="mb-3 text-lg font-semibold text-red-700">
                Rejection Reason
              </h3>

              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {
                  application.rejectionReason
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
                        "REJECTED"
                          ? "bg-red-600 hover:bg-red-700"
                          : status ===
                            "ACCEPTED"
                          ? "bg-green-600 hover:bg-green-700"
                          : status ===
                            "SHORTLISTED"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {updating
                        ? "Updating..."
                        : `Mark as ${getStatusLabel(
                            status
                          )}`}
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

// =====================================================
// INFO COMPONENT
// =====================================================
function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">

      <p className="text-xs font-medium uppercase text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-gray-900">
        {formatValue(value)}
      </p>

    </div>
  );
}

// =====================================================
// FORMAT OBJECT VALUES
// =====================================================
function getObjectValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value._id ||
      "-"
    );
  }

  return String(value);
}

// =====================================================
// FORMAT ANY VALUE SAFELY
// =====================================================
function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        formatValue(item)
      )
      .join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value._id ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

// =====================================================
// STATUS LABEL
// =====================================================
function getStatusLabel(status) {
  const labels = {
    SUBMITTED: "Submitted",
    SHORTLISTED: "Shortlisted",
    INTERVIEWED: "Interviewed",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };

  return (
    labels[status] ||
    status ||
    "-"
  );
}

export default Applications;