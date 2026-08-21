function StudentAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Announcements
        </h1>

        <p className="mt-2 text-gray-600">
          Stay updated with the latest bootcamp news and important information.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          No announcements yet.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          New bootcamp announcements will appear here.
        </p>
      </div>
    </div>
  );
}
export default StudentAnnouncements;