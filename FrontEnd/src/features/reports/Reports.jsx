import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

// Define styles for our PDF document
const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#ffffff' },
    header: { fontSize: 20, marginBottom: 10, color: '#1e293b' },
    subHeader: { fontSize: 10, marginBottom: 20, color: '#64748b' },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row'
    },
    tableColHeader: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#2f3d4a'
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableCellHeader: { margin: 5, fontSize: 10, color: '#ffffff', fontWeight: 'bold' },
    tableCell: { margin: 5, fontSize: 9, color: '#334155' }
});

// The actual PDF visual layout component
const ReportPDF = ({ reportData, reportType, columns }) => {
    const colWidth = `${100 / columns.length}%`;
    const title = reportType.charAt(0).toUpperCase() + reportType.slice(1);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>LMS Report: {title}</Text>
                <Text style={styles.subHeader}>Generated on: {new Date().toLocaleString()}</Text>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        {columns.map((c, i) => (
                            <View key={i} style={{ ...styles.tableColHeader, width: colWidth }}>
                                <Text style={styles.tableCellHeader}>{c.label}</Text>
                            </View>
                        ))}
                    </View>

                    {reportData.map((row, i) => (
                        <View key={i} style={styles.tableRow}>
                            {columns.map((c, j) => (
                                <View key={j} style={{ ...styles.tableCol, width: colWidth }}>
                                    <Text style={styles.tableCell}>{String(c.render ? c.render(row[c.key]) : (row[c.key] || 'N/A'))}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

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

    // Columns structure for both the on-screen DataTable AND the PDF builder
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

    const columns = getColumns();

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

                    {reportData.length > 0 ? (
                        <PDFDownloadLink
                            document={<ReportPDF reportData={reportData} reportType={reportType} columns={columns} />}
                            fileName={`LMS_${reportType}_Report_${new Date().toISOString().split('T')[0]}.pdf`}
                            className="flex items-center gap-2 bg-[#ff5b5b] hover:bg-[#e04a4a] text-white px-4 py-2 rounded font-semibold transition-colors shadow-sm"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={18} />
                                    {loading ? 'Preparing PDF...' : 'Download PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                    ) : (
                        <button disabled className="flex items-center gap-2 bg-slate-300 text-white px-4 py-2 rounded font-semibold cursor-not-allowed shadow-sm">
                            <Download size={18} />
                            Download PDF
                        </button>
                    )}
                </div>

                <div className="p-4">
                    <DataTable
                        columns={columns}
                        data={reportData}
                        loading={loadingReport}
                    />
                </div>
            </div>
        </div>
    );
};

export default Reports;
