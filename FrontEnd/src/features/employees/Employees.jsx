import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Edit, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        roleId: '',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true
    });

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/employees/roles');
            setRoles(response.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchRoles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEditClick = (employee) => {
        setFormData({
            firstName: employee.FirstName,
            lastName: employee.LastName || '',
            phone: employee.Phone || '',
            email: employee.Email || '',
            roleId: roles.find(r => r.RoleName === employee.RoleName)?.RoleId || '',
            salary: employee.Salary || '',
            joinDate: employee.JoinDate ? new Date(employee.JoinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            isActive: employee.IsActive
        });
        setEditingEmployeeId(employee.EmployeeId);
        setIsModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setFormData({
            firstName: '', lastName: '', phone: '', email: '', roleId: '', salary: '', joinDate: new Date().toISOString().split('T')[0], isActive: true
        });
        setEditingEmployeeId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployeeId) {
                await api.put(`/employees/${editingEmployeeId}`, formData);
                toast.success('Employee updated successfully!');
            } else {
                await api.post('/employees', formData);
                toast.success('Employee created successfully!');
            }
            setIsModalOpen(false);
            setFormData({
                firstName: '', lastName: '', phone: '', email: '', roleId: '', salary: '', joinDate: new Date().toISOString().split('T')[0], isActive: true
            });
            setEditingEmployeeId(null);
            fetchEmployees(); // Refresh the list
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to save employee. Please check inputs.');
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const q = searchQuery.toLowerCase();
        return (
            emp.FirstName?.toLowerCase().includes(q) ||
            emp.LastName?.toLowerCase().includes(q) ||
            emp.EmployeeCode?.toLowerCase().includes(q) ||
            emp.RoleName?.toLowerCase().includes(q) ||
            emp.Email?.toLowerCase().includes(q) ||
            emp.Phone?.toLowerCase().includes(q)
        );
    });

    const columns = [
        { key: 'EmployeeCode', label: 'Code' },
        {
            key: 'Name',
            label: 'Name',
            render: (_, row) => `${row.FirstName} ${row.LastName || ''}`.trim()
        },
        { key: 'RoleName', label: 'Role' },
        {
            key: 'Phone',
            label: 'Phone',
            render: (val) => val || 'N/A'
        },
        {
            key: 'Salary',
            label: 'Salary',
            render: (val) => `₹${val}`
        },
        {
            key: 'IsActive',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            searchable: false,
            render: (_, row) => (
                <button
                    onClick={() => handleEditClick(row)}
                    title="Edit Employee"
                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                >
                    <Edit size={18} />
                </button>
            )
        }
    ];

    return (
        <>
            <div>
                <div className="topbar">
                    <h3>Employee Management</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-1.5 focus-within:border-blue-500 transition-colors">
                            <Search size={15} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-sm text-slate-800 outline-none bg-transparent w-48 placeholder-slate-400"
                            />
                        </div>
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors shadow-sm"
                        >
                            + Add Employee
                        </button>
                    </div>
                </div>
                <div className="table-container pt-0 mt-4 relative">
                    <DataTable columns={columns} data={filteredEmployees} loading={loading} />
                </div>
            </div>

            {/* Add Employee Modal - Rendered outside the flow */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-[9999]"
                >
                    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Employee</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                <select required name="roleId" value={formData.roleId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.RoleId} value={role.RoleId}>{role.RoleName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                                    <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                                    <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                            </div>

                            {editingEmployeeId && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Employee</label>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingEmployeeId(null); }} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                                    {editingEmployeeId ? 'Update Employee' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Employees;
