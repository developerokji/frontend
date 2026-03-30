import React, { useState } from 'react';
import DataTable from '../components/common/DataTable';
import CustomButton from '../components/common/CustomButton';

const UsersPage = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Inactive' }
  ]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Email',
      key: 'email',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Role',
      key: 'role',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (text) => (
        <span className={`badge ${text === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
          {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="btn-group" role="group">
          <CustomButton 
            variant="primary" 
            size="sm"
            icon="bi-pencil"
            tooltip="Edit User"
          >
          </CustomButton>
          <CustomButton 
            variant="danger" 
            size="sm"
            icon="bi-trash"
            tooltip="Delete User"
          >
          </CustomButton>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Users Management</h2>
        <CustomButton variant="primary" icon="bi-plus-circle">
          Add User
        </CustomButton>
      </div>

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={users}
            loading={false}
            className="flex-grow-1"
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
