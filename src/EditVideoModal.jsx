import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import './AddCompilationModal.css';

function EditVideoModal({ video, onClose, onVideoUpdated }) {
  const [compilationName, setCompilationName] = useState(video.compilationName || '');
  const [filmingStart, setFilmingStart] = useState(video.filmingStart || '');
  const [editStart, setEditStart] = useState(video.editStart || '');
  // Preload release1, release2, and release3 from video.releases if present, sorted by part
  const sortedReleases = (video.releases || []).slice().sort((a, b) => a.part - b.part);
  const [release1, setRelease1] = useState(sortedReleases[0]?.releaseDateTime || '');
  const [release2, setRelease2] = useState(sortedReleases[1]?.releaseDateTime || '');
  const [release3, setRelease3] = useState(sortedReleases[2]?.releaseDateTime || '');
  const [stage, setStage] = useState(video.stage || '');
  const [status, setStatus] = useState(video.status || '');
  const [priority, setPriority] = useState(video.priority || '');
  const [referenceLink, setReferenceLink] = useState(video.referenceLink || '');
  const [comment, setComment] = useState(video.comment || '');

  const [directors, setDirectors] = useState([]);
  const [editors, setEditors] = useState([]);
  const [director, setDirector] = useState(video.director?.name || '');
  const [editor, setEditor] = useState(video.editor?.name || '');

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const [directorsResponse, editorsResponse] = await Promise.all([
          axiosInstance.get('http://localhost:8080/api/directors'),
          axiosInstance.get('http://localhost:8080/api/editors')
        ]);
        setDirectors(directorsResponse.data);
        setEditors(editorsResponse.data);
      } catch (error) {
        console.error('Failed to load directors or editors', error);
      }
    };
    fetchPeople();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (compilationName !== video.compilationName) {
        if (compilationName === '') {
          payload.clearCompilationName = true;
        } else {
          payload.compilationName = compilationName;
        }
      }
      if (filmingStart !== video.filmingStart) {
        if (filmingStart === '') {
          payload.clearFilmingStart = true;
        } else {
          payload.filmingStart = filmingStart;
        }
      }
      if (editStart !== video.editStart) {
        if (editStart === '') {
          payload.clearEditStart = true;
        } else {
          payload.editStart = editStart;
        }
      }
      const releases = [];
      if (release1) releases.push({ releaseDateTime: release1, part: 1 });
      if (release2) releases.push({ releaseDateTime: release2, part: 2 });
      if (release3) releases.push({ releaseDateTime: release3, part: 3 });

      if (release1 || release2 || release3) {
        payload.releases = releases;
      } else if (video.releases?.length) {
        // All cleared → send empty array to clear releases
        payload.releases = [];
      }
      if (stage === '') {
        payload.clearStage = true;
      } else if (stage !== video.stage) {
        payload.stage = stage;
      }
      // Only send clearStatus if user actually changed the status to blank
      if (status !== video.status) {
        if (status === '') {
          payload.clearStatus = true;
        } else {
          payload.status = status;
        }
      }
      // Always send clearPriority if user selects "-- None --", regardless of previous value
      if (priority === '') {
        payload.clearPriority = true;
      } else if (priority !== video.priority) {
        payload.priority = priority;
      }
      if (referenceLink === '') {
        payload.clearReferenceLink = true;
      } else if (referenceLink !== video.referenceLink) {
        payload.referenceLink = referenceLink;
      }
      if (comment === '') {
        payload.clearComment = true;
      } else if (comment !== video.comment) {
        payload.comment = comment;
      }
      if (director !== (video.director?.name || '')) {
        if (director === '') {
          payload.clearDirector = true;
        } else {
          const selectedDirector = directors.find(d => d.name === director);
          if (selectedDirector) payload.directorId = selectedDirector.id;
        }
      }
      if (editor !== (video.editor?.name || '')) {
        if (editor === '') {
          payload.clearEditor = true;
        } else {
          const selectedEditor = editors.find(e => e.name === editor);
          if (selectedEditor) payload.editorId = selectedEditor.id;
        }
      }
      console.log('PATCH payload:', payload);
      await axiosInstance.patch(`http://localhost:8080/api/videos/${video.id}`, payload);
      onVideoUpdated(); // Make sure this line is present
      onClose();
    } catch (error) {
      console.error('Failed to update video:', error);
      alert('Failed to update video. Please try again.');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this video?');
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`http://localhost:8080/api/videos/${video.id}`);
      console.log("Delete successful");
      onVideoUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Compilation</h2>
        <form onSubmit={handleUpdate}>
          <label>Compilation Name:</label>
          <input type="text" value={compilationName} onChange={(e) => setCompilationName(e.target.value)} />
          <br/>
          <label>Filming Start:</label>
          <input type="date" value={filmingStart} onChange={(e) => setFilmingStart(e.target.value)} />
          <br/>
          <label>Edit Start:</label>
          <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
          <br/>
          <label>Release 1:</label>
          <input type="datetime-local" value={release1} onChange={(e) => setRelease1(e.target.value)} />
          <br/>
          <label>Release 2:</label>
          <input type="datetime-local" value={release2} onChange={(e) => setRelease2(e.target.value)} />
          <br/>
          <label>Release 3:</label>
          <input type="datetime-local" value={release3} onChange={(e) => setRelease3(e.target.value)} />
          <br/>
          <label>Stage:</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">-- None --</option>
            <option value="PREP">Prep</option>
            <option value="FILMING">Filming</option>
            <option value="DONE_FILMING">Done Filming</option>
            <option value="CANCELED">Canceled</option>
            <option value="REFILM">Refilm</option>
          </select>
          <br/>
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">-- None --</option>
            <option value="EDITING">Editing</option>
            <option value="TESTING">Testing</option>
            <option value="READY">Ready</option>
            <option value="POSTED">Posted</option>
          </select>
          <br/>
          <label>Priority:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">-- None --</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <br/>
          <label>Director:</label>
          <select value={director} onChange={(e) => setDirector(e.target.value)}>
            <option value="">-- None --</option>
            {directors.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <br/>
          <label>Editor:</label>
          <select value={editor} onChange={(e) => setEditor(e.target.value)}>
            <option value="">-- None --</option>
            {editors.map(e => (
              <option key={e.id} value={e.name}>{e.name}</option>
            ))}
          </select>
          <br/>
          <label>Reference Link:</label>
          <input type="text" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)} />
          <br/>
          <label>Comment:</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          <br/>
          <button type="submit">Update</button>
        </form>
        <button onClick={handleDelete} className="close-button">Delete</button>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
}

export default EditVideoModal;
