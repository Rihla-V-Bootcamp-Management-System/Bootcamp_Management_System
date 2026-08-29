import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Download,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import apiClient from "../services/apiClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/certificates/my");
      const list = response.data?.certificates || [];
      setCertificates(list);
      if (list.length > 0) {
        setSelectedCertificate(list[0]);
      }
    } catch (err) {
      console.error("LOAD MY CERTIFICATES ERROR:", err);
      setError(
        err.response?.data?.message || "Failed to load your certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1f6f5b] dark:text-emerald-400">
            <Award size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Certificates
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Official verifiable graduation credentials awarded for bootcamp milestone completion.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchMyCertificates}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
        </div>
      ) : certificates.length === 0 ? (
        <Card className="text-center py-16 border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#d8a84e] mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No Certificate Issued Yet
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Certificates of Completion are awarded upon completing all 7 curriculum modules and submitting your final Capstone Project milestone. Keep building and completing daily tasks!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* CERTIFICATES LIST */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Earned Credentials ({certificates.length})
            </p>

            {certificates.map((cert) => {
              const isSelected = selectedCertificate?._id === cert._id;

              return (
                <button
                  key={cert._id}
                  type="button"
                  onClick={() => setSelectedCertificate(cert)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? "border-[#1f6f5b] bg-[#e5f1ed]/50 dark:bg-emerald-950/30 dark:border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck size={11} /> {cert.status}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(cert.issuedAt).getFullYear()}
                    </span>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {cert.title || "Bootcamp Completion Certificate"}
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {cert.batchId?.name || "ASTU MSJ Summer Bootcamp"}
                  </p>

                  <p className="mt-2 font-mono text-[10px] text-[#1f6f5b] dark:text-emerald-400 font-semibold">
                    {cert.certificateNumber}
                  </p>
                </button>
              );
            })}
          </div>

          {/* CERTIFICATE PREVIEW / PRINT CARD */}
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Certificate Document Preview
                </p>

                <div className="flex items-center gap-2">
                  {selectedCertificate.certificateUrl && (
                    <a
                      href={selectedCertificate.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#15253f] dark:bg-[#0b1528] dark:text-slate-200"
                    >
                      <ExternalLink size={13} /> Original File
                    </a>
                  )}

                  <Button size="sm" onClick={handlePrint}>
                    <Download size={13} /> Print / Save PDF
                  </Button>
                </div>
              </div>

              {/* DIPLOMA STYLE CARD */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-[#d8a84e]/40 bg-linear-to-b from-[#071325] via-[#0b1b36] to-[#071325] p-8 sm:p-12 text-center text-white shadow-2xl">
                {/* WATERMARK ORNAMENTS */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#d8a84e]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#1f6f5b]/20 blur-3xl" />

                {/* BISMILLAH */}
                <p className="font-serif text-lg text-[#d8a84e] sm:text-xl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="h-px w-12 bg-[#d8a84e]/60" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d8a84e]">
                    ASTU MSJ SUMMER BOOTCAMP
                  </span>
                  <span className="h-px w-12 bg-[#d8a84e]/60" />
                </div>

                <h2 className="mt-5 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
                  Certificate of Completion
                </h2>

                <p className="mt-4 text-xs sm:text-sm text-slate-300 font-light">
                  This is proudly presented to
                </p>

                {/* STUDENT NAME */}
                <div className="my-6 inline-block border-b-2 border-[#d8a84e] px-8 pb-2">
                  <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#d8a84e]">
                    {selectedCertificate.studentId?.name || "Student Graduate"}
                  </h3>
                </div>

                <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300">
                  for successfully completing all rigorous software engineering modules,
                  hands-on development tracks, algorithmic problem solving, and the final capstone project in{" "}
                  <strong className="text-white">
                    {selectedCertificate.batchId?.name || "Summer Cohort"}
                  </strong>.
                </p>

                {/* METADATA FOOTER */}
                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 border-t border-white/10 pt-6 text-xs text-slate-400">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Certificate ID</p>
                    <p className="mt-1 font-mono font-bold text-[#d8a84e]">
                      {selectedCertificate.certificateNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Issue Date</p>
                    <p className="mt-1 font-semibold text-white">
                      {new Date(selectedCertificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Issued By</p>
                    <p className="mt-1 font-semibold text-white">
                      {selectedCertificate.issuedBy?.name || "Bootcamp Administrator"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Officially Verified Credential</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentCertificates;
