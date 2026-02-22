import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [dashboardData, setDashboardData] = useState({
        kpis: {
            TotalRooms: 0,
            OccupiedRooms: 0,
            LowStockCount: 0
        },
        recentHousekeeping: [],
        recentInventory: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/reports/dashboard');
                setDashboardData(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div>
            <div className="topbar">
                <h3>Dashboard</h3>
            </div>

            <div className="card-grid">
                <div className="kpi-card border-t-0 p-0 overflow-hidden" style={{ padding: '0px' }}>
                    <div className="flex h-full w-full">
                        <div className="w-[80px] flex items-center justify-center bg-[#00c0ef] text-white flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"></path></svg>
                        </div>
                        <div className="flex-1 py-4 px-5">
                            <h3 className="text-3xl font-semibold text-slate-800 m-0">{dashboardData.kpis.TotalRooms}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Total Rooms</p>
                        </div>
                    </div>
                </div>

                <div className="kpi-card border-t-0 p-0 overflow-hidden" style={{ padding: '0px' }}>
                    <div className="flex h-full w-full">
                        <div className="w-[80px] flex items-center justify-center bg-[#f39c12] text-white flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="flex-1 py-4 px-5">
                            <h3 className="text-3xl font-semibold text-slate-800 m-0">{dashboardData.kpis.OccupiedRooms}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Occupied Rooms</p>
                        </div>
                    </div>
                </div>

                <div className="kpi-card border-t-0 p-0 overflow-hidden" style={{ padding: '0px' }}>
                    <div className="flex h-full w-full">
                        <div className="w-[80px] flex items-center justify-center bg-[#00a65a] text-white flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div className="flex-1 py-4 px-5">
                            <h3 className="text-3xl font-semibold text-slate-800 m-0">{dashboardData.kpis.TotalRooms - dashboardData.kpis.OccupiedRooms}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Available Rooms</p>
                        </div>
                    </div>
                </div>

                <div className="kpi-card border-t-0 p-0 overflow-hidden" style={{ padding: '0px' }}>
                    <div className="flex h-full w-full">
                        <div className="w-[80px] flex items-center justify-center bg-[#dd4b39] text-white flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div className="flex-1 py-4 px-5">
                            <h3 className="text-3xl font-semibold text-slate-800 m-0">{dashboardData.kpis.LowStockCount}</h3>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Low Stock Alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="card">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Today's Housekeeping</h2>
                        <Link to="/housekeeping" className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</Link>
                    </div>
                    {loading ? (
                        <p className="text-slate-500 text-sm">Loading tasks...</p>
                    ) : dashboardData.recentHousekeeping.length === 0 ? (
                        <p className="text-slate-500 text-sm">No tasks assigned for today.</p>
                    ) : (
                        <div className="space-y-3">
                            {dashboardData.recentHousekeeping.map(task => (
                                <div key={task.TaskId} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">Room {task.RoomNumber}</p>
                                        <p className="text-xs text-slate-500">{task.EmployeeName}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.Status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        task.Status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                        {task.Status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Recent Inventory Transactions</h2>
                        <Link to="/inventory" className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</Link>
                    </div>
                    {loading ? (
                        <p className="text-slate-500 text-sm">Loading transactions...</p>
                    ) : dashboardData.recentInventory.length === 0 ? (
                        <p className="text-slate-500 text-sm">No recent transactions.</p>
                    ) : (
                        <div className="space-y-3">
                            {dashboardData.recentInventory.map(tx => (
                                <div key={tx.TransactionId} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{tx.ItemName}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.TransactionDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${['PURCHASE', 'ADJUSTMENT'].includes(tx.TransactionType) ? 'text-green-600' : 'text-red-600'}`}>
                                            {['PURCHASE', 'ADJUSTMENT'].includes(tx.TransactionType) ? '+' : '-'}{tx.Quantity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
