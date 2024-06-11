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
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
  {"time": "2014-02-01T00", "latitude": 71.125, "longitude": -56.125, "variable": 99446, "condition_met": false},
];

export default function StickyHeadTable({ tableData=[],request=""}) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Define your columns based on your JSON structure
  const [columns,setColumns] = React.useState([
    { id: 'time', label: 'Time', maxWidth: 10 },
    { id: 'latitude', label: 'Latitude', maxWidth: 10 },
    { id: 'longitude', label: 'Longitude', maxWidth: 80 },
    { id: 'variable', label: 'Variable Value', maxWidth: 80 },
    { id: 'condition_met', label: 'Condition Met', maxWidth: 80 },
  ]);

  // Initialize rows based on tableData or use tableDataInitial if tableData is null/undefined
  const rows = React.useMemo(() => {
    console.log("Inside rows jsonData", tableData);

    if (Array.isArray(tableData) && tableData.length > 0) {
      if(request==="Times Query"){
        const newColumns = [{ id: 'time', label: 'Time', minWidth: 100 },
        // { id: 'variable', label: 'Variable Value', minWidth: 60 },
        { id: 'condition_met', label: 'Condition Met', minWidth: 60 }];
        setColumns(newColumns);
        return tableData.map((data, index) => ({
          id: index,
          time: data.time,
          // variable: data.variable,
          condition_met: data.condition_met,
          
        }));
      }
    else{
      const newColumns = [
        { id: 'latitude', label: 'Latitude', minWidth: 80 },
      { id: 'longitude', label: 'Longitude', minWidth: 80 },
        // { id: 'variable', label: 'Variable Value', minWidth: 60 },
        { id: 'condition_met', label: 'Condition Met', minWidth: 60 }];
        setColumns(newColumns);
      return tableData.map((data, index) => ({
        id: index,
        latitude: data.latitude,
        longitude: data.longitude,
        // variable: data.variable,
        condition_met: data.condition_met,
        
      }));
    }
  } else {
      // Use initial data if tableData is empty or undefined
      return tableDataInitial.map((data, index) => ({
        id: index,
        time: data.time,
        latitude: data.latitude,
        longitude: data.longitude,
        variable: data.variable,
        condition_met: data.condition_met,

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
    <Paper sx={{ width: "500px", height: "325px", overflow: 'auto' }}>
      <TableContainer sx={{ width: '100%' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'lightgrey' }}>
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
