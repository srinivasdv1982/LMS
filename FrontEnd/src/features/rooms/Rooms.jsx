import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROOM_TYPES = ['Single', 'Double', 'Twin', 'Suite', 'Deluxe', 'Family'];
const ROOM_STATUSES = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];

const STATUS_COLORS = {
    Available: 'bg-green-100 text-green-700',
    Occupied: 'bg-red-100 text-red-700',
    Cleaning: 'bg-yellow-100 text-yellow-700',
    Maintenance: 'bg-slate-200 text-slate-700',
};

const defaultForm = { roomNumber: '', floorId: '', roomType: 'Single', status: 'Available' };

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [deleting, setDeleting] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [roomsRes, floorsRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/rooms/floors'),
            ]);
            setRooms(roomsRes.data);
            setFloors(floorsRes.data);
        } catch (err) {
            toast.error('Failed to load rooms.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filteredRooms = rooms.filter(room => {
        const q = searchQuery.toLowerCase();
        return (
            room.RoomNumber?.toLowerCase().includes(q) ||
            room.RoomType?.toLowerCase().includes(q) ||
            room.FloorName?.toLowerCase().includes(q) ||
            room.Status?.toLowerCase().includes(q)
        );
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAdd = () => {
        setFormData(defaultForm);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (room) => {
        setFormData({
            roomNumber: room.RoomNumber,
            floorId: room.FloorId,
            roomType: room.RoomType || 'Single',
            status: room.Status,
        });
        setEditingId(room.RoomId);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/rooms/${editingId}`, formData);
                toast.success('Room updated!');
            } else {
                await api.post('/rooms', formData);
                toast.success('Room created!');
            }
            setIsModalOpen(false);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save room.');
        }
    };

    const handleDelete = async (room) => {
        if (!window.confirm(`Delete Room ${room.RoomNumber}? This cannot be undone.`)) return;
        setDeleting(room.RoomId);
        try {
            await api.delete(`/rooms/${room.RoomId}`);
            toast.success(`Room ${room.RoomNumber} deleted.`);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete room.');
        } finally {
            setDeleting(null);
        }
    };

    const columns = [
        { key: 'RoomNumber', label: 'Room No.' },
        { key: 'RoomType', label: 'Type' },
        {
            key: 'FloorName',
            label: 'Floor',
            render: (val, row) => `${val} (Floor ${row.FloorNumber})`
        },
        {
            key: 'Status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[val] || 'bg-slate-100 text-slate-600'}`}>
                    {val}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            searchable: false,
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEdit(row)}
                        title="Edit Room"
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    >
                        <Edit size={17} />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={deleting === row.RoomId || row.Status === 'Occupied'}
                        title={row.Status === 'Occupied' ? 'Cannot delete occupied room' : 'Delete Room'}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={17} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <div>
                <div className="topbar">
                    <h3>Room Management</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-1.5 focus-within:border-blue-500 transition-colors">
                            <Search size={15} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search rooms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="text-sm text-slate-800 outline-none bg-transparent w-44 placeholder-slate-400"
                            />
                        </div>
                        <button
                            onClick={openAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors shadow-sm"
                        >
                            + Add Room
                        </button>
                    </div>
                </div>

                <div className="table-container pt-0 mt-4 relative">
                    <DataTable columns={columns} data={filteredRooms} loading={loading} />
                </div>
            </div>

            {/* Add / Edit Room Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-[9999]">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            {editingId ? 'Edit Room' : 'Add New Room'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Number *</label>
                                    <input
                                        required
                                        type="text"
                                        name="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 101"
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Floor *</label>
                                    <select
                                        required
                                        name="floorId"
                                        value={formData.floorId}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select Floor</option>
                                        {floors.map(f => (
                                            <option key={f.FloorId} value={f.FloorId}>
                                                {f.FloorName} (Floor {f.FloorNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                                    <select
                                        name="roomType"
                                        value={formData.roomType}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                                    >
                                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                                    >
                                        {ROOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                                >
                                    {editingId ? 'Update Room' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Rooms;
