import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    const [reportType, setReportType] = useState('employees');
    const [reportData, setReportData] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);

    // Initial Dashboard Summary Fetch
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/reports/lodge-summary');
                setSummary(response.data);
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                setLoadingSummary(false);
            }
        };
        fetchSummary();
    }, []);

    // Dynamic Report Fetch based on dropdown
    useEffect(() => {
        const fetchReportData = async () => {
            setLoadingReport(true);
            try {
                let response;
                switch (reportType) {
                    case 'employees':
                        response = await api.get('/employees');
                        break;
                    case 'rooms':
                        response = await api.get('/rooms');
                        break;
                    case 'inventory':
                        response = await api.get('/inventory');
                        break;
                    default:
                        response = { data: [] };
                }
                setReportData(response.data);
            } catch (err) {
                console.error('Error fetching report data:', err);
                toast.error('Failed to load report data');
            } finally {
                setLoadingReport(false);
            }
        };

        fetchReportData();
    }, [reportType]);

    const generatePDF = () => {
        if (reportData.length === 0) {
            toast.error('No data available to export');
            return;
        }

        try {
            const doc = new jsPDF();

            // Generate a simple text-only PDF to test for file corruption
            doc.setFontSize(22);
            doc.text(`Test Document: ${reportType}`, 20, 30);
            doc.setFontSize(14);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
            doc.text(`Total Records: ${reportData.length}`, 20, 60);

            doc.save(`LMS_Test_${reportType}.pdf`);
            toast.success('Test PDF Downloaded successfully!');
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    // Columns structure for the on-screen DataTable
    const getColumns = () => {
        if (reportType === 'employees') {
            return [
                { key: 'EmployeeId', label: 'ID', render: val => `#${val}` },
                { key: 'FirstName', label: 'First Name' },
                { key: 'LastName', label: 'Last Name' },
                { key: 'RoleName', label: 'Role' },
                { key: 'Department', label: 'Department' }
            ];
        }
        if (reportType === 'rooms') {
            return [
                { key: 'RoomId', label: 'ID', render: val => `#${val}` },
                { key: 'RoomNumber', label: 'Room No' },
                { key: 'RoomType', label: 'Type' },
                { key: 'Status', label: 'Status' }
            ];
        }
        if (reportType === 'inventory') {
            return [
                { key: 'InventoryItemId', label: 'ID', render: val => `#${val}` },
                { key: 'ItemName', label: 'Item Name' },
                { key: 'Category', label: 'Category' },
                { key: 'CurrentStock', label: 'Stock' }
            ];
        }
        return [];
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Lodge Performance Report</h1>

            {/* Top KPI Cards (remains from previous version) */}
            {!loadingSummary && summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Rooms', value: summary.totalRooms, color: '#3b82f6' },
                        { label: 'Occupied Rooms', value: summary.occupiedRooms, color: '#ef4444' },
                        { label: 'Occupancy Rate', value: summary.occupancyRate, color: '#10b981' },
                        { label: 'Total Employees', value: summary.totalEmployees, color: '#f59e0b' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded shadow-sm border-l-4" style={{ borderColor: stat.color }}>
                            <div className="text-slate-500 text-sm mb-1 font-semibold uppercase">{stat.label}</div>
                            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detailed Reports Section */}
            <div className="bg-white rounded shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                        <label className="font-semibold text-slate-700">Select Report Data:</label>
                        <select
                            className="bg-white border border-slate-300 rounded px-3 py-2 text-slate-700 outline-none focus:border-blue-500"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="employees">Employee Roster</option>
                            <option value="rooms">Room Status List</option>
                            <option value="inventory">Inventory Stock</option>
                        </select>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={loadingReport || reportData.length === 0}
                        className="flex items-center gap-2 bg-[#ff5b5b] hover:bg-[#e04a4a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>

                <div className="p-4">
                    <DataTable
                        columns={getColumns()}
                        data={reportData}
                        loading={loadingReport}
                    />
                </div>
            </div>
        </div>
    );
};

export default Reports;
