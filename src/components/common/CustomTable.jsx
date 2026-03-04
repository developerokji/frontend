import React from 'react';

const CustomTable = ({ 
  columns, 
  data, 
  loading = false, 
  pagination = null,
  actions = null,
  className = '',
  ...props 
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="table table-hover table-striped" {...props}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                scope="col"
                className={column.className || ''}
                style={column.style || {}}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                <i className="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    className={column.className || ''}
                    style={column.style || {}}
                  >
                    {column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;
