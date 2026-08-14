function MentorDashboard() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, Mentor!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your students and activities.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50">
            Search
          </button>
          <button className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50">
            Notifications
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Students
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            24
          </h2>
          <p className="mt-2 text-sm text-green-600">
            +2 this week
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Average Attendance
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            94%
          </h2>
          <p className="mt-2 text-sm text-green-600">
            +1.2%
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Student Progress
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            78%
          </h2>
          <div className="mt-3 h-2 rounded-full bg-gray-200">
            <div className="h-2 w-[78%] rounded-full bg-purple-600" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Assignments
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            12
          </h2>
          <p className="mt-2 text-sm text-red-500">
            Needs review
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Students Attendance Over Time
            </h2>
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
              Last 30 Days
            </button>
          </div>

          <div className="flex h-72 items-end gap-5 border-b border-l px-6 pb-4">
            <div className="h-[60%] w-full rounded-t bg-purple-200" />
            <div className="h-[70%] w-full rounded-t bg-purple-300" />
            <div className="h-[65%] w-full rounded-t bg-purple-300" />
            <div className="h-[78%] w-full rounded-t bg-purple-400" />
            <div className="h-[73%] w-full rounded-t bg-purple-400" />
            <div className="h-[88%] w-full rounded-t bg-purple-500" />
            <div className="h-[85%] w-full rounded-t bg-purple-600" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6</span>
            <span>Week 7</span>
          </div>

        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Upcoming Sessions
              </h2>
              <button className="text-sm text-purple-600">
                View all
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">
                  Web Development
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Tuesday · 10:00 AM
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">
                  Group Feedback
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Thursday · 2:00 PM
                </p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-purple-50 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100">
              View Full Schedule
            </button>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold">
              Recent Announcements
            </h2>

            <div className="space-y-5">
              <div>
                <p className="font-medium">
                  Project 2 Deadline Extended
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  The deadline has been extended.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  2 hours ago
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium">
                  Guest Speaker Session
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Join the special session this Sunday.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Yesterday
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MentorDashboard