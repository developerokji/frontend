import React, { useState } from 'react';
import CustomButton from '../components/common/CustomButton';
import SearchBar from '../components/common/SearchBar';
import CustomTable from '../components/common/CustomTable';
import Pagination from '../components/common/Pagination';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
      joinDate: '2024-01-15',
      stories: 12
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Editor',
      status: 'Active',
      joinDate: '2024-02-20',
      stories: 8
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Viewer',
      status: 'Inactive',
      joinDate: '2024-03-10',
      stories: 2
    }
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
            {text.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="fw-medium">{text}</div>
            <small className="text-muted">{record.email}</small>
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role) => (
        <span className={`badge ${
          role === 'Admin' ? 'bg-danger' : 
          role === 'Editor' ? 'bg-warning' : 'bg-info'
        }`}>
          {role}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <span className={`badge ${status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
          {status}
        </span>
      )
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      render: (date) => <small>{new Date(date).toLocaleDateString()}</small>
    },
    {
      title: 'Stories',
      dataIndex: 'stories',
      render: (count) => (
        <span className="badge bg-primary rounded-pill">{count}</span>
      )
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <div className="btn-group btn-group-sm" role="group">
          <button type="button" className="btn btn-outline-primary">
            <i className="bi bi-pencil"></i>
          </button>
          <button type="button" className="btn btn-outline-danger">
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-3 p-lg-4 w-100 h-100 d-flex flex-column">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">User Management</h4>
        <CustomButton icon="bi-person-plus">
          Add User
        </CustomButton>
      </div>

      <div className="card flex-grow-1 d-flex flex-column w-100">
        <div className="card-body flex-grow-1 d-flex flex-column w-100">
          <div className="row mb-3 flex-shrink-0">
            <SearchBar
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-grow-1">
            <CustomTable
              columns={columns}
              data={users}
              className="h-100"
            />
          </div>

          <div className="flex-shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={1}
              onPageChange={setCurrentPage}
              showingFrom={1}
              showingTo={users.length}
              totalItems={users.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
