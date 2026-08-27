import React, { useState, useEffect } from 'react';

export default function StudentNotifications() {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [recipients, setRecipients] = useState('STUDENTS');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchAssignedStudents();
  }, []);

  const fetchAssignedStudents = async () => {
    try {
      const res = await fetch('/api/announcements/mentor/assigned-students', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
        setSelectedIds(data.map((s) => s.id));
      }
    } catch (err) {
      showToast('error', 'Failed to load assigned students.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.id));
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: '', msg: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      showToast('error', 'Please select at least one student.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipients,
          title,
          message,
          targetStudentIds: selectedIds
        })
      });

      const result = await res.json();
      if (res.ok) {
        showToast('success', 'Notification sent to selected students!');
        setTitle('');
        setMessage('');
      } else {
        showToast('error', result.error || 'Failed to send notification.');
      }
    } catch (err) {
      showToast('error', 'Server error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] p-8 font-sans">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Student Notifications</h1>
        <p className="text-sm text-slate-500">
          Send messages to your assigned students or their parents.
        </p>
      </div>

      {/* Toast Alert */}
      {toast.msg && (
        <div
          className={`mb-4 p-4 rounded-md text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Compose Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Compose</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">
                Recipients
              </label>
              <select
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="STUDENTS">Students</option>
                <option value="PARENTS">Parents</option>
                <option value="BOTH">Both (Students & Parents)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">
                Message
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0a101d] text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Right Column: Assigned Students List */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Assigned Students</h2>
            {students.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {selectedIds.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading assigned students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No students assigned.</div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {students.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-center space-x-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-slate-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.batchName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}