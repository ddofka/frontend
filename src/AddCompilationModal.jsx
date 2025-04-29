import React, {useState} from 'react';
import './AddCompilationModal.css';
import axiosInstance from './axiosInstance';

function AddCompilationModal({ onClose, onVideoAdded }) {

    const [filmingStart, setFilmingStart] = useState('');
    const [editStart, setEditStart] = useState('');
    const [stage, setStage] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [compilationName, setCompilationName] = useState('');
    const [referenceLink, setReferenceLink] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop page refresh

        const payload = {
            filmingStart,
            editStart,
            compilationName
        };
        if (stage !== '') payload.stage = stage;
        if (status !== '') payload.status = status;
        if (priority !== '') payload.priority = priority;
        if (referenceLink.trim().length >= 8) payload.referenceLink = referenceLink;
        if (comment.trim().length >= 4) payload.comment = comment;

        try {
            console.log("Token in localStorage:", localStorage.getItem("token"));
            const response = await axiosInstance({
                method: 'post',
                url: 'http://localhost:8080/api/videos',
                data: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Response from backend:", response);
        } catch (error) {
            console.error("Error adding video:", error.response || error);
            alert("Failed to add compilation.");
            return; // important: exit if POST fails
        }

        // ✅ Only run these if POST succeeded
        onVideoAdded();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Compilation</h2>
                <form onSubmit={handleSubmit}>
                    <label>Filming Start</label>
                    <input type="date"
                           value={filmingStart}
                           onChange={(e) => setFilmingStart(e.target.value)}
                           required
                    />
                    <br/>
                    <label>Edit Start</label>
                    <input type="date"
                            value={editStart}
                            onChange={(e) => setEditStart(e.target.value)}
                    />
                    <br/>
                    <label>Stage:</label>
                    <select value={stage} onChange={(e) => setStage(e.target.value)}>
                        <option value="">Select Stage</option>
                        <option value="PREP">Prep</option>
                        <option value="FILMING">Filming</option>
                        <option value="DONE_FILMING">Done Filming</option>
                        <option value="REFILM">Editing</option>
                        <option value="CANCELED">Canceled</option>
                    </select>
                    <br/>
                    <label>Status:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Select Status</option>
                        <option value="EDITING">Editing</option>
                        <option value="TESTING">Testing</option>
                        <option value="READY">Ready</option>
                        <option value="POSTED">Posted</option>
                    </select>
                    <br/>
                    <label>Priority:</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="">Select Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                    <br/>
                    <label>Compilation Name:</label>
                    <input
                        type="text"
                        value={compilationName}
                        onChange={(e) => setCompilationName(e.target.value)}
                        required
                    />
                    <br/>
                    <label>Reference Link:</label>
                    <input
                        type="text"
                        value={referenceLink}
                        onChange={(e) => setReferenceLink(e.target.value)}
                    />
                    <br/>
                    <label>Comment:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <br/>
                    <button type="submit">Submit</button>
                </form>
                <button onClick={onClose} className="close-button">Close</button>
            </div>
        </div>
    );
}

export default AddCompilationModal;