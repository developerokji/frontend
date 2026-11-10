import React, { useState } from 'react';
import DataTable from '../components/common/DataTable';
import { CustomButton } from '../components/common/CustomButton';

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
      render: () => (
        <div className="d-inline-flex align-items-center gap-2 flex-nowrap">
          <CustomButton
            variant="primary"
            size="sm"
            icon="bi-pencil"
            tooltip="Edit User"
          />
          <CustomButton
            variant="danger"
            size="sm"
            icon="bi-trash"
            tooltip="Delete User"
          />
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-3 p-lg-4 w-100 min-w-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h4 className="fw-bold mb-0">Users Management</h4>
        <CustomButton variant="primary" size="sm" icon="bi-plus-circle">
          Add User
        </CustomButton>
      </div>

      <div className="card shadow-sm border-0">
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
