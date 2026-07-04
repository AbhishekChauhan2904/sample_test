import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const STATUS_FILTERS = ['ALL', 'PENDING', 'RUNNING', 'SUCCESS', 'FAILED'];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

 const fetchTasks = useCallback(async () => {
  try {
    const params = new URLSearchParams({ page, limit: 8 });
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    setTasks(data.tasks);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error('Failed to fetch tasks', err);
  } finally {
    setLoading(false);
  }
}, [page, statusFilter]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Tasks</h1>
        <Link to="/tasks/new" className="btn-new-task">+ New Task</Link>
      </div>

      <div className="filter-bar">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
            onClick={() => handleFilterChange(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Create your first AI processing task!</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <Link to={`/tasks/${task._id}`} key={task._id} className="task-card">
              <div className="task-card-info">
                <h3>{task.title}</h3>
                <div className="task-card-meta">
                  {task.operationType.replace('_', ' ')} • {new Date(task.createdAt).toLocaleString()}
                </div>
              </div>
              <span className={`status-badge status-${task.status}`}>{task.status}</span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
