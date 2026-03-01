import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Plus, UserPlus, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [unmappedEmployees, setUnmappedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);

    // Form states
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedUserToReset, setSelectedUserToReset] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, unmappedRes] = await Promise.all([
                api.get('/users'),
                api.get('/users/unmapped')
            ]);
            setUsers(usersRes.data);
            setUnmappedEmployees(unmappedRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load users data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', {
                employeeId: selectedEmployeeId,
                username,
                password
            });
            toast.success('User account created successfully');
            setIsAddOpen(false);
            // Reset form
            setSelectedEmployeeId('');
            setUsername('');
            setPassword('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await api.put(`/users/${userId}/toggle-status`);
            toast.success('User status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUserToReset.UserId}/reset-password`, {
                newPassword: password
            });
            toast.success('Password reset successfully');
            setIsResetOpen(false);
            setSelectedUserToReset(null);
            setPassword('');
        } catch (error) {
            toast.error('Failed to reset password');
        }
    };

    const openResetModal = (user) => {
        setSelectedUserToReset(user);
        setPassword('');
        setIsResetOpen(true);
    };

    const columns = [
        { key: 'UserId', label: 'User ID', render: (val) => `#${val}` },
        {
            key: 'EmployeeCode',
            label: 'Employee Code',
            render: (_, row) => (
                <div>
                    <div className="font-semibold text-slate-800">{row.EmployeeCode}</div>
                </div>
            )
        },
        {
            key: 'FirstName',
            label: 'Employee Name',
            render: (_, row) => (
                <div>
                    <div className="font-semibold text-slate-800">{row.FirstName} {row.LastName || ''}</div>
                </div>
            )
        },
        { key: 'RoleName', label: 'Role', render: (val) => <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">{val}</span> },
        { key: 'Username', label: 'Login Username', render: (val) => <span className="font-mono text-sm">{val}</span> },
        {
            key: 'IsActive',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {val ? 'Active' : 'Disabled'}
                </span>
            )
        },
        {
            key: 'LastLoginAt',
            label: 'Last Login',
            render: (val) => val ? new Date(val).toLocaleString() : 'Never'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, item) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleToggleStatus(item.UserId)}
                        className={`p-1.5 rounded transition-colors ${item.IsActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={item.IsActive ? "Disable User" : "Enable User"}
                    >
                        {item.IsActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                    </button>
                    <button
                        onClick={() => openResetModal(item)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        title="Reset Password"
                    >
                        <KeyRound size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-[#ff5b5b] hover:bg-[#e04a4a] text-white px-4 py-2 rounded font-semibold transition-colors shadow-sm"
                >
                    <UserPlus size={18} />
                    Map Employee to User
                </button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                loading={loading}
            />

            {/* Add User Modal */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Map Employee to User Account">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">-- Select an unmapped employee --</option>
                            {unmappedEmployees.map(emp => (
                                <option key={emp.EmployeeId} value={emp.EmployeeId}>
                                    {emp.EmployeeCode} - {emp.FirstName} {emp.LastName || ''} ({emp.RoleName})
                                </option>
                            ))}
                        </select>
                        {unmappedEmployees.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">All current employees already have linked login accounts.</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Login Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="e.g. jdoe123"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="Enter initial password"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsAddOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedEmployeeId}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset User Password">
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4">
                        <span className="text-sm text-slate-500 block">Resetting password for username:</span>
                        <span className="font-mono font-semibold text-slate-800">{selectedUserToReset?.Username}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsResetOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-rose-600 text-white font-medium rounded hover:bg-rose-700 transition-colors"
                        >
                            Confirm Reset
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
