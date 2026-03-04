import React, { useState } from 'react';

const Locality = () => {
  const [localities, setLocalities] = useState([
    {
      id: 1,
      name: 'Downtown Area',
      code: 'DT001',
      status: 'Active',
      stories: 8,
      users: 45
    },
    {
      id: 2,
      name: 'North District',
      code: 'ND002',
      status: 'Active',
      stories: 5,
      users: 32
    },
    {
      id: 3,
      name: 'East Zone',
      code: 'EZ003',
      status: 'Inactive',
      stories: 2,
      users: 18
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container-fluid p-3 p-lg-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <h4>Locality Management</h4>
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add Locality
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search localities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Stories</th>
                  <th>Users</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localities.map((locality) => (
                  <tr key={locality.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-info text-white rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-geo-alt"></i>
                        </div>
                        <span className="fw-medium">{locality.name}</span>
                      </div>
                    </td>
                    <td>
                      <code>{locality.code}</code>
                    </td>
                    <td>
                      <span className={`badge ${locality.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {locality.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary rounded-pill">{locality.stories}</span>
                    </td>
                    <td>
                      <span className="badge bg-info rounded-pill">{locality.users}</span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button type="button" className="btn btn-outline-primary">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button type="button" className="btn btn-outline-danger">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3">
            <span className="text-muted small">Showing 1 to 3 of 3 entries</span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex="-1">
                    <span aria-hidden="true">&laquo;</span> Previous
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item disabled">
                  <a className="page-link" href="#">
                    Next <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locality;
