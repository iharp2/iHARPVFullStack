import React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Papa from 'papaparse';
import myinitialTable from '../assets/tableDataTimes.json'


export default function TableTimesComponent({ tableData = [] }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [columns, setColumns] = React.useState([
    { id: 'time', label: 'Time', maxWidth: 200 },
    { id: 'condition_met', label: 'Condition Met', maxWidth: 150 },
  ]);

  const rows = React.useMemo(() => {
    if (Array.isArray(tableData) && tableData.length > 0) {
      setPage(0);
      // if (request === "Times Query") {
      const newColumns = [{ id: 'time', label: 'Time', minWidth: 200 },
      { id: 'condition_met', label: 'Condition Met', minWidth: 150 }];
      setColumns(newColumns);
      return tableData.map((data, index) => ({
        id: index,
        time: data.time,
        condition_met: data.condition_met,
      }));
      // }

    } else {
      if (myinitialTable) {
        return myinitialTable.map((data, index) => ({
          id: index,
          time: data.time,
          condition_met: data.condition_met,
        }));
      }
      else {
        return;
      }
    }
  }, [tableData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleDownload = () => {
    const csvData = Papa.unparse(rows);
    const timestamp = new Date().toLocaleString().replace(/\/|,|:|\s/g, "_"); // Replace special characters for filename compatibility
    const filename = `table_data_${timestamp}.csv`; // Generate filename with readable timestamp
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    if (navigator.msSaveBlob) { // For IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
  return (
    <Paper sx={{ width: "100%", overflow: 'auto', width: '330px', maxHeight: '310px' }}>

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleDownload} style={{ fontSize: '12px', height: '30px', minWidth: '90px', margin: '5px' }}>
          Download
        </Button>
        <TablePagination
          rowsPerPageOptions={[5, 20, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': {
              // marginLeft: '-20px',

              fontSize: '20px', // Set your desired font size here
            },
            '& .MuiTablePagination-selectLabel': {
              // marginTop: '10px',
              // marginLeft: '-50px',
              fontSize: '0px', // Set your desired font size here
            },
            '& .MuiTablePagination-displayedRows': {
              marginTop: '10px',
              marginLeft: '-30px',
              fontSize: '14px', // Set your desired font size here
            },
            '& .MuiTablePagination-select': {
              marginLeft: '-30px',
              fontSize: '15px', // Set your desired font size here
            },
            '& .MuiTablePagination-menuItem': {
              marginLeft: '-50px',
              fontSize: '12px', // Set your desired font size here
            },
          }}
        />
      </div>
    </Paper>
  );
}
