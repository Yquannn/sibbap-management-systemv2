// ReportTable.jsx
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ReportTable = ({ data, type, module }) => {
  if (!data || data.length === 0) return null;
  
  // Get column headers from the first item
  const columns = Object.keys(data[0]);
  
  return (
    <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 440 }}>
      <Table stickyHeader aria-label="report table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>
                {column.replace(/_/g, ' ').toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={`${index}-${column}`}>
                  {row[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportTable;