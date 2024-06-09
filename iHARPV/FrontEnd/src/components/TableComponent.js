import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

const tableDataInitial = [
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
  {"time": "2014-02-01T00:00:00", "latitude": 71.125, "longitude": -56.125, "sp": 99446.1202725448, "condition_met": false, "latitude2": 72.625, "longitude2": -55.625},
];

export default function StickyHeadTable({ tableData=[] }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Define your columns based on your JSON structure
  const columns = [
    { id: 'time', label: 'Time', minWidth: 100 },
    { id: 'latitude', label: 'Latitude', minWidth: 100 },
    { id: 'longitude', label: 'Longitude', minWidth: 100 },
    { id: 'sp', label: 'Variable', minWidth: 100 },
    { id: 'condition_met', label: 'Condition Met', minWidth: 150 },
    // { id: 'latitude2', label: 'Latitude 2', minWidth: 100 },
    // { id: 'longitude2', label: 'Longitude 2', minWidth: 100 },
  ];

  // Initialize rows based on tableData or use tableDataInitial if tableData is null/undefined
  const rows = React.useMemo(() => {
    console.log("Inside rows jsonData", tableData);

    if (Array.isArray(tableData) && tableData.length > 0) {
      return tableData.map((data, index) => ({
        id: index,
        time: data.time,
        latitude: data.latitude,
        longitude: data.longitude,
        sp: data.sp,
        condition_met: data.condition_met,
        
      }));
    } else {
      // Use initial data if tableData is empty or undefined
      return tableDataInitial.map((data, index) => ({
        id: index,
        time: data.time,
        latitude: data.latitude,
        longitude: data.longitude,
        sp: data.sp,
        condition_met: data.condition_met,
        // latitude2: data.latitude2,
        // longitude2: data.longitude2,
      }));
    }
  }, [tableData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0); // Reset page to 0 when changing rows per page
  };

  return (
    <Paper sx={{ width: "750px", height: "325px", overflow: 'auto' }}>
      <TableContainer sx={{ width: '100%' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align="center" style={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align="center">
                      {column.id === 'condition_met' ? (row[column.id] ? 'True' : 'False') : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
