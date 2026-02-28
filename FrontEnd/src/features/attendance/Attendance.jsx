import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import toast from 'react-hot-toast';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('daily');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [saving, setSaving] = useState(false);

    const selectedDate = new Date(date);
    const now = new Date();
    const diffDays = (now.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24);
    const isPastLimit = diffDays > 15;

    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isFuture = selectedDateOnly > todayOnly;

    const isEditDisabled = isPastLimit || isFuture;

    const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
    const numDays = daysInMonth(year, month);
    const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                if (viewMode === 'daily') {
                    const response = await api.get(`/attendance?date=${date}`);
                    setEmployees(response.data);
                } else {
                    const response = await api.get(`/attendance/monthly?month=${month}&year=${year}`);
                    setEmployees(response.data);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [date, viewMode, month, year]);

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

    const getStatusIcon = (status) => {
        if (status === 'Present') return <span className="text-green-600 font-bold">P</span>;
        if (status === 'Absent') return <span className="text-red-600 font-bold">A</span>;
        if (status === 'Leave') return <span className="text-yellow-600 font-bold">L</span>;
        if (status === 'HalfDay') return <span className="text-orange-600 font-bold">H</span>;
        return <span className="text-slate-300">-</span>;
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div>
            <div className="topbar">
                <div className="flex flex-col gap-1">
                    <h3>Employee Attendance</h3>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'daily' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Daily View
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Monthly View
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {viewMode === 'daily' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-container pt-0 mt-4 overflow-hidden">
                {viewMode === 'daily' ? (
                    <DataTable columns={columns} data={employees} loading={loading} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-3 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[150px]">Employee</th>
                                    {daysArray.map(d => (
                                        <th key={d} className="p-2 text-center font-medium text-slate-500 border-r border-slate-100 min-w-[32px]">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={numDays + 1} className="p-8 text-center text-slate-400">Loading monthly data...</td>
                                    </tr>
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={numDays + 1} className="p-8 text-center text-slate-400">No employees found.</td>
                                    </tr>
                                ) : (
                                    employees.map(emp => (
                                        <tr key={emp.EmployeeId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                <div className="font-medium text-slate-800">{emp.FirstName} {emp.LastName}</div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-tight">{emp.RoleName}</div>
                                            </td>
                                            {daysArray.map(d => (
                                                <td key={d} className="p-2 text-center border-r border-slate-50">
                                                    {getStatusIcon(emp.attendance?.[d])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="flex gap-4 p-3 mt-2 text-[11px] text-slate-500 border-t border-slate-100">
                            <div className="flex items-center gap-1"><span className="text-green-600 font-bold">P</span> Present</div>
                            <div className="flex items-center gap-1"><span className="text-red-600 font-bold">A</span> Absent</div>
                            <div className="flex items-center gap-1"><span className="text-yellow-600 font-bold">L</span> Leave</div>
                            <div className="flex items-center gap-1"><span className="text-orange-600 font-bold">H</span> Half Day</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
