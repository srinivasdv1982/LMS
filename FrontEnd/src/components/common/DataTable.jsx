import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        primary: {
            main: '#2563eb',
        },
    },
});

const DataTable = ({ columns, data, loading, onRowClick }) => {
    // Transform our custom columns structure to MUI DataGrid format
    const muiColumns = useMemo(() => {
        return columns.map(col => {
            const muiCol = {
                field: col.key,
                headerName: col.label,
                flex: 1,
                minWidth: 150,
                sortable: col.sortable !== false,
                filterable: col.searchable !== false,
                editable: col.editable === true,
            };

            // Support our custom render functions which expect (value, rowData)
            if (col.render) {
                muiCol.renderCell = (params) => {
                    return col.render(params.value, params.row);
                };
            }

            return muiCol;
        });
    }, [columns]);

    // Ensure every row has a unique 'id' field required by DataGrid
    const processedData = useMemo(() => {
        if (!data) return [];
        return data.map((row, index) => {
            const rowId = row.id ?? row.Id ?? row.EmployeeId ?? row.RoomId ?? row.TaskId ?? row.ItemCode ?? row.NewsId ?? row.AdId ?? `row-${index}`;
            return {
                ...row,
                id: rowId
            };
        });
    }, [data]);

    return (
        <ThemeProvider theme={lightTheme}>
            <div style={{ height: 600, width: '100%', backgroundColor: '#ffffff', borderRadius: '8px' }}>
                <DataGrid
                    rows={processedData}
                    columns={muiColumns}
                    loading={loading}
                    onRowClick={(params) => onRowClick && onRowClick(params.row)}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 }
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        '& .MuiDataGrid-cell': {
                            borderColor: '#f1f5f9',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            color: '#1e293b',
                            fontWeight: '600',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f8fafc',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                        },
                        '& .MuiDataGrid-iconSeparator': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-menuIcon': {
                            visibility: 'visible',
                            width: 'auto',
                            color: '#64748b',
                        }
                    }}
                />
            </div>
        </ThemeProvider>
    );
};

export default DataTable;
