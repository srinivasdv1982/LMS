import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Housekeeping = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ roomId: '', assignedTo: '' });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/housekeeping?date=${selectedDate}`);
            setTasks(response.data);
        } catch (err) {
            console.error('Error fetching housekeeping tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [roomsRes, empRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/employees')
            ]);
            setRooms(roomsRes.data);
            setEmployees(empRes.data.filter(e => e.Department === 'Housekeeping' || !e.Department)); // Allow all if no strict dept
        } catch (err) {
            console.error('Failed to fetch rooms/employees', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [selectedDate]);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/housekeeping', {
                ...newAssignment,
                taskDate: selectedDate
            });
            toast.success('Task assigned successfully!');
            setIsAssignModalOpen(false);
            setNewAssignment({ roomId: '', assignedTo: '' });
            fetchTasks(); // Refresh list
        } catch (err) {
            console.error('Failed to assign task', err);
            const errorMsg = err.response?.data?.message || 'Error assigning task';
            toast.error(errorMsg);
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.patch('/housekeeping/status', { taskId, status: newStatus });
            setTasks(tasks.map(t => t.TaskId === taskId ? { ...t, Status: newStatus } : t));
            toast.success(`Task status updated to ${newStatus}`);
        } catch (err) {
            console.error('Error updating task status:', err);
            toast.error('Failed to update task status');
        }
    };

    const columns = [
        { key: 'TaskId', label: 'ID', render: (val) => `#${val}` },
        { key: 'RoomNumber', label: 'Room' },
        { key: 'EmployeeName', label: 'Assigned To' },
        {
            key: 'Status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs ${val === 'Completed' ? 'bg-green-900 text-green-400' :
                    val === 'In Progress' ? 'bg-yellow-900 text-yellow-400' :
                        'bg-red-900 text-red-400'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: 'CreatedAt',
            label: 'Task Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
        },
        {
            key: 'actions',
            label: 'Actions',
            searchable: false,
            render: (_, row) => (
                <select
                    className="bg-white text-slate-700 border border-slate-300 rounded p-1 text-sm shadow-sm"
                    value={row.Status}
                    onChange={(e) => updateStatus(row.TaskId, e.target.value)}
                >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            )
        }
    ];

    return (
        <div>
            <div className="topbar">
                <h3>Housekeeping Management</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-600">Assign Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="flex items-center gap-2 bg-[#ff5b5b] hover:bg-[#e04a4a] text-white px-4 py-2 rounded font-semibold text-sm transition-colors shadow-sm"
                    >
                        <Plus size={16} />
                        Assign Task
                    </button>
                </div>
            </div>

            <div className="table-container pt-0 mt-4 relative">
                <DataTable columns={columns} data={tasks} loading={loading} />
            </div>

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Assign Housekeeping Task</h2>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAssignTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Room</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={newAssignment.roomId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, roomId: e.target.value })}
                                >
                                    <option value="">-- Choose a Room --</option>
                                    {rooms.map(room => (
                                        <option key={room.RoomId} value={room.RoomId}>{room.RoomNumber} - {room.Floor}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To Employee</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={newAssignment.assignedTo}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, assignedTo: e.target.value })}
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.EmployeeId} value={emp.EmployeeId}>{emp.FirstName} {emp.LastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
                                >
                                    Assign Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Housekeeping;
