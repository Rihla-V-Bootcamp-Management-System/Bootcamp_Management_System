import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Upload,
  Eye,
  Ban,
  RefreshCw,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminCertificates = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // ---------------------------------------------------------
  // STUDENT FILTERS
  // ---------------------------------------------------------
  const [genderFilter, setGenderFilter] = useState("All");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit] = useState(10);
  const [studentPagination, setStudentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ---------------------------------------------------------
  // CERTIFICATE FILTERS
  // ---------------------------------------------------------
  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificateStatus, setCertificateStatus] = useState("All");
  const [certificatePage, setCertificatePage] = useState(1);
  const [certificateLimit] = useState(10);
  const [certificatePagination, setCertificatePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ---------------------------------------------------------
  // CERTIFICATE SETTINGS
  // ---------------------------------------------------------
  const [certificateTitle, setCertificateTitle] = useState(
    "Bootcamp Completion Certificate"
  );
  const [certificateUrl, setCertificateUrl] = useState("");
  const [certificatePublicId, setCertificatePublicId] = useState("");

  // ---------------------------------------------------------
  // ALERTS
  // ---------------------------------------------------------
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD BATCHES
  // =========================================================
  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      setError("");

      const response = await apiClient.get("/batches");
      const data = response.data;
      const loadedBatches = data?.batches || data?.data || [];

      const list = Array.isArray(loadedBatches) ? loadedBatches : [];
      setBatches(list);

      if (!selectedBatchId && list.length > 0) {
        setSelectedBatchId(list[0]._id);
        loadBatchStudents(list[0]._id, 1);
      }
    } catch (err) {
      console.error("Load batches error:", err);
      setError(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  // =========================================================
  // LOAD CERTIFICATES
  // =========================================================
  const loadCertificates = async (page = certificatePage) => {
    try {
      setLoadingCertificates(true);

      const params = {
        page,
        limit: certificateLimit,
      };

      if (certificateSearch.trim()) {
        params.search = certificateSearch.trim();
      }

      if (certificateStatus !== "All") {
        params.status = certificateStatus;
      }

      const response = await apiClient.get("/certificates", { params });
      const data = response.data;

      setCertificates(
        Array.isArray(data?.certificates) ? data.certificates : []
      );

      setCertificatePagination(
        data?.pagination || {
          page,
          limit: certificateLimit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("Load certificates error:", err);
      setError(err.response?.data?.message || "Failed to load certificates.");
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    loadBatches();
    loadCertificates(1);
  }, []);

  // =========================================================
  // LOAD BATCH STUDENTS
  // =========================================================
  const loadBatchStudents = async (batchId, page = studentPage) => {
    if (!batchId) {
      setStudents([]);
      setStatistics(null);
      setSelectedStudentIds([]);
      setStudentPagination({
        page: 1,
        limit: studentLimit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");
      setSuccess("");

      const params = {
        page,
        limit: studentLimit,
        gender: genderFilter,
      };

      if (studentSearch.trim()) {
        params.search = studentSearch.trim();
      }

      const response = await apiClient.get(`/certificates/batch/${batchId}`, {
        params,
      });

      const data = response.data;
      setStudents(Array.isArray(data?.students) ? data.students : []);
      setStatistics(data?.statistics || null);

      setStudentPagination(
        data?.pagination || {
          page,
          limit: studentLimit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );

      setSelectedStudentIds([]);
    } catch (err) {
      console.error("Load batch students error:", err);
      setStudents([]);
      setStatistics(null);
      setError(err.response?.data?.message || "Failed to load batch students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleBatchChange = (event) => {
    const batchId = event.target.value;
    setSelectedBatchId(batchId);
    setStudentPage(1);
    setGenderFilter("All");
    setStudentSearch("");
    setSelectedStudentIds([]);
    loadBatchStudents(batchId, 1);
  };

  const handleGenderChange = (event) => {
    const gender = event.target.value;
    setGenderFilter(gender);
    setStudentPage(1);
    setSelectedStudentIds([]);
    if (selectedBatchId) {
      loadBatchStudents(selectedBatchId, 1);
    }
  };

  const handleStudentSearch = () => {
    setStudentPage(1);
    setSelectedStudentIds([]);
    if (selectedBatchId) {
      loadBatchStudents(selectedBatchId, 1);
    }
  };

  const goToStudentPage = (page) => {
    if (page < 1 || page > studentPagination.totalPages) return;
    setStudentPage(page);
    loadBatchStudents(selectedBatchId, page);
  };

  const eligibleStudents = useMemo(() => {
    return students.filter((item) => item?.eligible && !item?.certificate);
  }, [students]);

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }
      return [...previous, studentId];
    });
  };

  const selectAllEligible = () => {
    const ids = eligibleStudents
      .map((item) => item?.student?._id)
      .filter(Boolean);
    setSelectedStudentIds(ids);
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleCertificateUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (!isPdf && !isImage) {
        setError("Please upload a PDF or image certificate.");
        return;
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        // Mock fallback if env not configured
        setCertificateUrl(URL.createObjectURL(file));
        setSuccess("Certificate template file loaded (Local preview mode).");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.error?.message || "Cloudinary upload failed."
        );
      }

      setCertificateUrl(uploadData?.secure_url || "");
      setCertificatePublicId(uploadData?.public_id || "");
      setSuccess("Certificate file uploaded successfully.");
    } catch (err) {
      console.error("Certificate upload error:", err);
      setError(err.message || "Failed to upload certificate.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const issueSelectedCertificates = async () => {
    if (!selectedBatchId) {
      setError("Please select a batch first.");
      return;
    }

    if (selectedStudentIds.length === 0) {
      setError("Please select at least one eligible student.");
      return;
    }

    if (!certificateTitle.trim()) {
      setError("Please enter a certificate title.");
      return;
    }

    try {
      setIssuing(true);
      setError("");
      setSuccess("");

      const response = await apiClient.post(
        `/certificates/batch/${selectedBatchId}`,
        {
          studentIds: selectedStudentIds,
          title: certificateTitle.trim(),
          certificateUrl,
          certificatePublicId,
        }
      );

      const data = response.data;
      const summary = data?.summary;

      if (summary) {
        setSuccess(
          `${summary.issued} certificate(s) issued successfully. ${summary.skipped} skipped.`
        );
      } else {
        setSuccess(data?.message || "Certificates issued successfully.");
      }

      setSelectedStudentIds([]);
      await loadBatchStudents(selectedBatchId, studentPage);
      await loadCertificates(certificatePage);
    } catch (err) {
      console.error("Issue certificates error:", err);
      setError(
        err.response?.data?.message || "Failed to issue certificates."
      );
    } finally {
      setIssuing(false);
    }
  };

  const revokeCertificate = async (certificateId) => {
    const reason = window.prompt(
      "Enter the reason for revoking this certificate:"
    );

    if (reason === null) return;

    try {
      setRevokingId(certificateId);
      setError("");
      setSuccess("");

      const response = await apiClient.patch(
        `/certificates/${certificateId}/revoke`,
        { reason }
      );

      setSuccess(
        response.data?.message || "Certificate revoked successfully."
      );

      await loadCertificates(certificatePage);
      if (selectedBatchId) {
        await loadBatchStudents(selectedBatchId, studentPage);
      }
    } catch (err) {
      console.error("Revoke certificate error:", err);
      setError(
        err.response?.data?.message || "Failed to revoke certificate."
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleCertificateFilter = () => {
    setCertificatePage(1);
    loadCertificates(1);
  };

  const goToCertificatePage = (page) => {
    if (page < 1 || page > certificatePagination.totalPages) return;
    setCertificatePage(page);
    loadCertificates(page);
  };

  const handleRefresh = async () => {
    setError("");
    setSuccess("");
    await loadBatches();
    await loadCertificates(certificatePage);
    if (selectedBatchId) {
      await loadBatchStudents(selectedBatchId, studentPage);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString();
  };

  const totalIssued = certificatePagination.total || certificates.length;
  const activeCertificates = certificates.filter(
    (certificate) => certificate.status === "Issued"
  ).length;
  const revokedCertificates = certificates.filter(
    (certificate) => certificate.status === "Revoked"
  ).length;

  const getPageNumbers = (current, total) => {
    if (!total) return [];
    const pages = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1f6f5b] dark:text-emerald-400">
            <Award size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Certificates & Graduation
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Audit student milestone eligibility, configure templates, and issue verifiable graduation certificates.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loadingBatches || loadingStudents || loadingCertificates}
        >
          <RefreshCw
            size={15}
            className={
              loadingBatches || loadingStudents || loadingCertificates
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </Button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <p>{success}</p>
        </div>
      )}

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Certificates</p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
                {totalIssued}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-[#070e1b] text-slate-700 dark:text-slate-300">
              <Award size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Issued</p>
              <p className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeCertificates}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <CheckCircle size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revoked</p>
              <p className="mt-1.5 text-2xl font-bold text-red-600 dark:text-red-400">
                {revokedCertificates}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-2.5 dark:bg-red-950/60 text-red-600 dark:text-red-300">
              <Ban size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Eligible</p>
              <p className="mt-1.5 text-2xl font-bold text-[#1f6f5b] dark:text-blue-400">
                {selectedBatchId ? statistics?.eligibleStudents || 0 : 0}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/60 text-[#1f6f5b] dark:text-blue-300">
              <Users size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* BATCH SELECTOR */}
      <Card className="p-5 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Select Batch for Certification
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pick an active cohort to view student curriculum completion and certificate readiness.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <select
              value={selectedBatchId}
              onChange={handleBatchChange}
              disabled={loadingBatches}
              className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-xs font-semibold text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white focus:outline-none"
            >
              <option value="">
                {loadingBatches ? "Loading batches..." : "Select a batch"}
              </option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} {batch.year ? `(${batch.year})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </Card>

      {/* STUDENTS AUDIT TABLE */}
      {selectedBatchId && (
        <Card className="overflow-hidden border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="border-b border-slate-100 dark:border-[#15253f] p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Batch Students Eligibility Audit
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Students must complete all 7 core curriculum tracks to qualify for certification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={selectAllEligible}
                    disabled={eligibleStudents.length === 0}
                  >
                    Select All Eligible ({eligibleStudents.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSelection}
                    disabled={selectedStudentIds.length === 0}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStudentSearch()}
                    placeholder="Search student by name, email or ID..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white focus:outline-none"
                  />
                </div>

                <select
                  value={genderFilter}
                  onChange={handleGenderChange}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white focus:outline-none"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <Button variant="outline" onClick={handleStudentSearch}>
                  <Filter size={14} /> Filter
                </Button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center p-12">
              <RefreshCw size={26} className="animate-spin text-[#1f6f5b]" />
              <p className="mt-2 text-xs text-slate-400">Loading student progress...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No students found for this batch and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-600 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3 w-10">Select</th>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">User ID</th>
                    <th className="px-5 py-3">Curriculum Progress</th>
                    <th className="px-5 py-3">Eligibility</th>
                    <th className="px-5 py-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#15253f] text-slate-800 dark:text-slate-200">
                  {students.map((item) => {
                    const student = item?.student;
                    if (!student) return null;
                    const isSelected = selectedStudentIds.includes(student._id);
                    const progress = Number(item.progressPercentage || 0);

                    return (
                      <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-[#070e1b]/50">
                        <td className="px-5 py-3.5">
                          {item.eligible && !item.certificate ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudent(student._id)}
                              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1f6f5b] focus:ring-[#1f6f5b]"
                            />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-medium">
                          <div>{student.name || "Unknown Student"}</div>
                          <div className="text-[11px] text-slate-400">{student.email}</div>
                        </td>

                        <td className="px-5 py-3.5">{student.gender || "-"}</td>
                        <td className="px-5 py-3.5 font-mono text-[11px]">{student.userID || "-"}</td>

                        <td className="px-5 py-3.5">
                          <div className="w-36">
                            <div className="mb-1 flex justify-between text-[11px]">
                              <span>{progress}%</span>
                              <span className="text-slate-400">{item.completedTopics?.length || 0}/7 tracks</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-[#1f6f5b] dark:bg-emerald-400 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {item.eligible ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle size={12} /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <XCircle size={12} /> Pending ({item.incompleteTopics?.length || 0})
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          {item.certificate ? (
                            <div>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  item.certificate.status === "Issued"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                    : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                }`}
                              >
                                {item.certificate.status}
                              </span>
                              <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                                {item.certificate.certificateNumber}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">Not issued</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ISSUE ACTION FOOTER */}
          {selectedStudentIds.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4 dark:border-[#15253f] dark:bg-[#070e1b]">
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {selectedStudentIds.length} eligible student(s) selected for certificate generation.
              </p>
              <Button onClick={issueSelectedCertificates} disabled={issuing || uploading}>
                {issuing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Issuing...
                  </>
                ) : (
                  <>
                    <Award size={14} /> Issue Certificates Now
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ISSUED CERTIFICATES ARCHIVE */}
      <Card className="overflow-hidden border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
        <div className="border-b border-slate-100 dark:border-[#15253f] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Issued Certificates Registry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official records of certificates issued across cohorts with unique verifiable certificate IDs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={certificateStatus}
                onChange={(e) => setCertificateStatus(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white"
              >
                <option value="All">All Status</option>
                <option value="Issued">Issued</option>
                <option value="Revoked">Revoked</option>
              </select>

              <Button size="sm" variant="outline" onClick={handleCertificateFilter}>
                <Filter size={13} /> Filter
              </Button>
            </div>
          </div>
        </div>

        {loadingCertificates ? (
          <div className="p-10 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="mx-auto animate-spin text-[#1f6f5b]" />
            <p className="mt-2">Loading certificates registry...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No issued certificates found in registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-600 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">Certificate Number</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Issue Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#15253f] text-slate-800 dark:text-slate-200">
                {certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/50 dark:hover:bg-[#070e1b]/50">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#1f6f5b] dark:text-emerald-400">
                      {cert.certificateNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{cert.studentId?.name || "Student"}</div>
                      <div className="text-[11px] text-slate-400">{cert.studentId?.email}</div>
                    </td>
                    <td className="px-5 py-3.5">{cert.batchId?.name || "-"}</td>
                    <td className="px-5 py-3.5">{formatDate(cert.issuedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          cert.status === "Issued"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {cert.status === "Issued" && (
                        <button
                          type="button"
                          onClick={() => revokeCertificate(cert._id)}
                          disabled={revokingId === cert._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
                        >
                          <Ban size={12} />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminCertificates;
