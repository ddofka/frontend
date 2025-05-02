import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import './AddCompilationModal.css';

function BulkEditModal({ videoIds, onClose, onBulkEdited }) {
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [priority, setPriority] = useState('');
  const [filmingStart, setFilmingStart] = useState('');
  const [editStart, setEditStart] = useState('');
  const [directors, setDirectors] = useState([]);
  const [editors, setEditors] = useState([]);
  const [director, setDirector] = useState('');
  const [editor, setEditor] = useState('');

  const [clearStage, setClearStage] = useState(false);
  const [clearStatus, setClearStatus] = useState(false);
  const [clearPriority, setClearPriority] = useState(false);
  const [clearFilmingStart, setClearFilmingStart] = useState(false);
  const [clearEditStart, setClearEditStart] = useState(false);
  const [clearDirector, setClearDirector] = useState(false);
  const [clearEditor, setClearEditor] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const [dRes, eRes] = await Promise.all([
          axiosInstance.get('http://localhost:8080/api/directors'),
          axiosInstance.get('http://localhost:8080/api/editors')
        ]);
        setDirectors(dRes.data);
        setEditors(eRes.data);
      } catch (error) {
        console.error('Error loading people:', error);
      }
    };
    fetchPeople();
  }, []);

  const handleBulkUpdate = async () => {
    const payload = {};

    if (clearStage) payload.clearStage = true;
    if (clearStatus) payload.clearStatus = true;
    if (clearPriority) payload.clearPriority = true;
    if (clearFilmingStart) payload.clearFilmingStart = true;
    if (clearEditStart) payload.clearEditStart = true;
    if (clearDirector) payload.clearDirector = true;
    if (clearEditor) payload.clearEditor = true;

    if (stage) payload.stage = stage;
    if (status) payload.status = status;
    if (priority) payload.priority = priority;
    if (filmingStart) payload.filmingStart = filmingStart;
    if (editStart) payload.editStart = editStart;

    if (director) {
      const selectedDirector = directors.find(d => d.name === director);
      if (selectedDirector) payload.directorId = selectedDirector.id;
    }
    if (editor) {
      const selectedEditor = editors.find(e => e.name === editor);
      if (selectedEditor) payload.editorId = selectedEditor.id;
    }

    try {
      console.log('PATCH payload:', payload);
      await Promise.all(
        videoIds.map(id =>
          axiosInstance.patch(`http://localhost:8080/api/videos/${id}`, payload)
        )
      );
      onBulkEdited();
      onClose();
    } catch (error) {
      console.error('Bulk update failed:', error);
      alert('Bulk update failed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Bulk Edit {videoIds.length} Video{videoIds.length > 1 ? 's' : ''}</h2>
        <label>Stage:</label>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">-- Skip --</option>
            <option value="PREP">Prep</option>
            <option value="FILMING">Filming</option>
            <option value="DONE_FILMING">Done Filming</option>
            <option value="CANCELED">Canceled</option>
            <option value="REFILM">Refilm</option>
        </select>
        <input type="checkbox" checked={clearStage} onChange={() => setClearStage(!clearStage)} /> Clear
        <br/>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">-- Skip --</option>
            <option value="EDITING">Editing</option>
            <option value="TESTING">Testing</option>
            <option value="READY">Ready</option>
            <option value="POSTED">Posted</option>
        </select>
        <input type="checkbox" checked={clearStatus} onChange={() => setClearStatus(!clearStatus)} /> Clear
        <br/>
        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">-- Skip --</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <input type="checkbox" checked={clearPriority} onChange={() => setClearPriority(!clearPriority)} /> Clear
        <br/>
        <label>Filming Start:</label>
        <input type="date" value={filmingStart} onChange={(e) => setFilmingStart(e.target.value)} />
        <input type="checkbox" checked={clearFilmingStart} onChange={() => setClearFilmingStart(!clearFilmingStart)} /> Clear
        <br/>
        <label>Edit Start:</label>
        <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
        <input type="checkbox" checked={clearEditStart} onChange={() => setClearEditStart(!clearEditStart)} /> Clear
        <br/>
        <label>Director:</label>
        <select value={director} onChange={(e) => setDirector(e.target.value)}>
          <option value="">-- Skip --</option>
          {directors.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <input type="checkbox" checked={clearDirector} onChange={() => setClearDirector(!clearDirector)} /> Clear
        <br/>
        <label>Editor:</label>
        <select value={editor} onChange={(e) => setEditor(e.target.value)}>
          <option value="">-- Skip --</option>
          {editors.map(e => (
            <option key={e.id} value={e.name}>{e.name}</option>
          ))}
        </select>
        <input type="checkbox" checked={clearEditor} onChange={() => setClearEditor(!clearEditor)} /> Clear
        <br/>
        <button onClick={handleBulkUpdate}>Apply Changes</button>
        <button onClick={onClose} className="close-button">Cancel</button>
      </div>
    </div>
  );
}

export default BulkEditModal;