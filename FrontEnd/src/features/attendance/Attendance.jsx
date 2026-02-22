import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import toast from 'react-hot-toast';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    const selectedDate = new Date(date);
    const now = new Date();
    const diffDays = (now.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24);
    const isPastLimit = diffDays > 15;

    // Reset time to start of day for accurate future comparison
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isFuture = selectedDateOnly > todayOnly;

    const isEditDisabled = isPastLimit || isFuture;

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/attendance?date=${date}`);
                setEmployees(response.data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [date]);

    const handleStatusChange = (employeeId, status) => {
        setEmployees(employees.map(emp =>
            emp.EmployeeId === employeeId ? { ...emp, Status: status } : emp
        ));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            await api.post('/attendance/batch', { attendances: employees.map(e => ({ employeeId: e.EmployeeId, status: e.Status })), date });
            toast.success('Attendance saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            key: 'Name',
            label: 'Name',
            render: (_, row) => `${row.FirstName} ${row.LastName || ''}`.trim()
        },
        { key: 'RoleName', label: 'Role' },
        {
            key: 'Status',
            label: 'Current Status',
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${val === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                    val === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                        val === 'Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                    {val || 'Pending'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Quick Mark',
            searchable: false,
            render: (_, row) => (
                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {['Present', 'Absent', 'Leave'].map(s => (
                        <button
                            key={s}
                            disabled={isEditDisabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isEditDisabled) handleStatusChange(row.EmployeeId, s);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors border ${row.Status === s
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                                } ${isEditDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="topbar">
                <h3>Employee Attendance</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-600">Date:</label>
                        <input
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    {isPastLimit && (
                        <span className="text-red-500 font-medium text-sm">Cannot edit records older than 15 days.</span>
                    )}
                    {isFuture && (
                        <span className="text-red-500 font-medium text-sm">Cannot mark attendance for future dates.</span>
                    )}
                    <button
                        onClick={() => setEmployees(employees.map(e => ({ ...e, Status: 'Present' })))}
                        disabled={isEditDisabled}
                        className="px-4 py-1.5 text-sm font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Mark All Present
                    </button>
                    <button
                        onClick={saveAttendance}
                        className="px-4 py-1.5 text-sm font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving || isEditDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>
            <div className="table-container pt-0 mt-4">
                <DataTable columns={columns} data={employees} loading={loading} />
            </div>
        </div>
    );
};

export default Attendance;
