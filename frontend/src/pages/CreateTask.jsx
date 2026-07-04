import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/task.css';
import '../styles/auth.css';
const API_URL = process.env.REACT_URL || 'http://localhost:5001/api';

const OPERATIONS = [
  { value: 'UPPERCASE', label: 'Uppercase' },
  { value: 'LOWERCASE', label: 'Lowercase' },
  { value: 'REVERSE', label: 'Reverse String' },
  { value: 'WORD_COUNT', label: 'Word Count' }
];

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operationType, setOperationType] = useState('UPPERCASE');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, inputText, operationType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create task');
    navigate(`/tasks/${data._id}`);
  } catch (err) {
    setError(err.message || 'Failed to create task');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="page-container">
      <div className="card">
        <h2>Create New Task</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Convert product description"
              required
            />
          </div>

          <div className="form-group">
            <label>Input Text</label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter the text to process..."
              required
            />
          </div>

          <div className="form-group">
            <label>Operation Type</label>
            <select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
              {OPERATIONS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Running Task...' : 'Run Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
