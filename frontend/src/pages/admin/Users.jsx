import mockUsers from "../../data/mockUsers";
import { useState } from "react";
function Users() {
    const [users, setUsers] = useState(mockUsers);
    const [search, setSearch] = useState("");
  return (
    <div>
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered users and their accounts.
          </p>
        </div>

        <button className="rounded-lg bg-[#242827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          + Add Account
        </button>
      </div>

      
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users
                .filter((user) =>
                    `${user.name} ${user.email} ${user.role}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((user) => (
                <tr
                  key={user.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium capitalize text-green-700">
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                                <button
            onClick={() => {
                const confirmed = window.confirm(
                `Are you sure you want to delete ${user.name}?`
                );

                if (confirmed) {
                setUsers((currentUsers) =>
                    currentUsers.filter((item) => item.id !== user.id)
                );
                }
            }}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
            Delete
            </button>
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

export default Users;