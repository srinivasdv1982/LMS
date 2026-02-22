import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get('/reports/lodge-summary');
                setSummary(response.data);
            } catch (err) {
                console.error('Error fetching report:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) return <div className="p-4 text-white">Loading Reports...</div>;
    if (!summary) return <div className="p-4 text-white">No data available.</div>;

    const stats = [
        { label: 'Total Rooms', value: summary.totalRooms, color: '#3b82f6' },
        { label: 'Occupied Rooms', value: summary.occupiedRooms, color: '#ef4444' },
        { label: 'Occupancy Rate', value: summary.occupancyRate, color: '#10b981' },
        { label: 'Total Employees', value: summary.totalEmployees, color: '#f59e0b' },
    ];

    return (
        <div className="dashboard-content p-6">
            <h1 className="text-2xl font-bold mb-6 text-[#eff6ff]">Lodge Performance Report</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6 border-l-4" style={{ borderColor: stat.color }}>
                        <div className="text-[#94a3b8] text-sm mb-1">{stat.label}</div>
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="card p-6">
                <h2 className="text-xl font-bold mb-4 text-[#eff6ff]">Key Insights</h2>
                <div className="space-y-4 text-[#cbd5e1]">
                    <p>Current Occupancy stands at <strong>{summary.occupancyRate}</strong>.</p>
                    <p>There are <strong>{summary.totalEmployees}</strong> active staff members assigned to this lodge.</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
