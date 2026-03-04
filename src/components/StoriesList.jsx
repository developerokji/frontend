import React, { useState } from 'react';
import AddStoryModal from './AddStoryModal';

const StoriesList = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stories = [
    {
      id: 1,
      date: '04 Jan 2026 07:33 PM',
      image: '2026',
      status: 'Off'
    }
  ];

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveStory = () => {
    // Handle save logic here
    handleCloseModal();
  };

  return (
    <div className="h-100 d-flex flex-column p-3 p-lg-4 w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 flex-shrink-0">
        <h4 className="mb-0">Stories List</h4>
        <button className="btn btn-primary btn-sm btn-lg-0 w-100 w-sm-auto" onClick={handleShowModal}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Stories
        </button>
      </div>

      <div className="card flex-grow-1 d-flex flex-column w-100">
        <div className="card-body flex-grow-1 d-flex flex-column w-100">
          <div className="row mb-3 flex-shrink-0">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive flex-grow-1 w-100">
            <table className="table table-hover table-striped h-100 w-100">
              <thead className="sticky-top bg-white">
                <tr>
                  <th scope="col" className="d-none d-md-table-cell">Date</th>
                  <th scope="col">Image</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="d-none d-lg-table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => (
                  <tr key={story.id}>
                    <td className="d-none d-md-table-cell">
                      <small className="text-muted">{story.date}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                          <span className="fw-bold">{story.image}</span>
                        </div>
                        <div className="d-md-none">
                          <small className="text-muted d-block">{story.date}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${story.status === 'On' ? 'bg-success' : 'bg-secondary'}`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="d-none d-lg-table-cell">
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

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 flex-shrink-0">
            <span className="text-muted small">Showing 1 to 1 of 1 entry</span>
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

      <AddStoryModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSave={handleSaveStory}
      />
    </div>
  );
};

export default StoriesList;
