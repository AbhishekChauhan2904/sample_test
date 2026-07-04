import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/task.css';
const API_URL = process.env.REACT_URL || 'http://localhost:5001/api';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTask = useCallback(async () => {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, { headers: authHeaders() });
    const data = await res.json();
    setTask(data);
  } catch (err) {
    console.error('Failed to fetch task', err);
  } finally {
    setLoading(false);
  }
}, [id]);

  useEffect(() => {
    fetchTask();
    const interval = setInterval(() => {
      if (task && (task.status === 'SUCCESS' || task.status === 'FAILED')) return;
      fetchTask();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchTask, task]);

const handleDelete = async () => {
  if (!window.confirm('Delete this task?')) return;
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
  navigate('/dashboard');
};

const handleRerun = async () => {
  const res = await fetch(`${API_URL}/tasks/${id}/rerun`, { method: 'POST', headers: authHeaders() });
  const data = await res.json();
  setTask(data);
};

  if (loading) return <div className="loading-spinner">Loading task...</div>;
  if (!task) return <div className="loading-spinner">Task not found.</div>;

  return (
    <div className="page-container">
      <div className="card">
        <div className="task-detail-header">
          <h2>{task.title}</h2>
          <span className={`status-badge status-${task.status}`}>{task.status}</span>
        </div>

        <div className="detail-row">
          <div className="detail-label">Operation</div>
          <div className="detail-box">{task.operationType.replace('_', ' ')}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Input Text</div>
          <div className="detail-box">{task.inputText}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Result</div>
          <div className="detail-box">
            {task.result !== null && task.result !== undefined ? String(task.result) : 'Not available yet'}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Execution Logs</div>
          <div className="logs-box">
            {task.logs && task.logs.length > 0 ? (
              task.logs.map((log, idx) => (
                <div className="log-line" key={idx}>
                  <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  {log.message}
                </div>
              ))
            ) : (
              <div className="log-line">No logs yet.</div>
            )}
          </div>
        </div>

        <div className="detail-actions">
          {task.status === 'FAILED' && (
            <button className="btn-secondary" onClick={handleRerun}>Re-run Task</button>
          )}
          <button className="btn-danger" onClick={handleDelete}>Delete Task</button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
