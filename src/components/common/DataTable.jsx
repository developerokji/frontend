import React from 'react';

const DataTable = ({ data, columns, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
        No data available
      </div>
    );
  }

  return (
    <div className={`table-responsive ${className}`}>
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className={column.className}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
