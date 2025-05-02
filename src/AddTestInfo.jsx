import React, { useState, useEffect } from 'react';
import './AddTestInfo.css';
import axiosInstance from "./axiosInstance.js";

const AddTestInfo = ({ isOpen, onClose, videoData, refreshData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    // Use exactly the same videoData that comes from the VideoList
    const testOptions = Array.isArray(videoData)
        ? videoData.map(v => v.compilationName)
        : [];
    const [selectedVideo, setSelectedVideo] = useState(null);
    const filteredOptions = testOptions.filter(option =>
        option?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [rows, setRows] = useState([{ version: "V1", retentionTime: "30s", retentionValue: "" }]);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedVideo(null);
            setRows([{ version: "V1", retentionTime: "30s", retentionValue: "" }]);
            return;
        }

        if (!selectedVideo) return;

        const selected = selectedVideo;

        if (selected?.tests?.length > 0) {
            const uniqueRows = selected.tests.map((t) => ({
                version: t.version,
                retentionTime: t.retentionTime,
                retentionValue: t.retentionValue,
            }));
            setRows(uniqueRows);
        } else {
            setRows([{ version: "V1", retentionTime: "30s", retentionValue: "" }]);
        }
    }, [selectedVideo, videoData, isOpen]);

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleAddRow = () => {
        const existingCombos = rows.map(r => `${r.version}-${r.retentionTime}`);
        const allVersions = ["V1", "V2", "V3", "V4", "V5"];
        const allTimes = ["3s", "15s", "30s", "45s"];

        for (let v of allVersions) {
            for (let t of allTimes) {
                if (!existingCombos.includes(`${v}-${t}`)) {
                    setRows([...rows, { version: v, retentionTime: t, retentionValue: "" }]);
                    return;
                }
            }
        }
    };

    const handleDeleteRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows.length ? newRows : [{ version: "V1", retentionTime: "30s", retentionValue: "" }]);
    };

    const handleSave = async () => {
        const isValid = rows.every(row =>
            row.version &&
            row.retentionTime &&
            row.retentionValue !== "" &&
            !isNaN(parseFloat(row.retentionValue))
        );
        if (!isValid) {
            alert("Please fill in all fields correctly before saving.");
            return;
        }

        // Find the selected video object by compilationName to get its ID
        const selectedVideoObj = videoData.find(v => v.compilationName === selectedVideo.compilationName);
        if (!selectedVideoObj || !selectedVideoObj.id) {
            alert("Could not find selected video ID.");
            return;
        }

        try {
            const response = await axiosInstance.patch(`http://localhost:8080/api/videos/${selectedVideoObj.id}`, {
                tests: rows
            });

            console.log("Test info saved successfully:", response.data);

            // Call the refreshData function from parent to update all data
            if (typeof refreshData === 'function') {
                await refreshData();
            }

            onClose();
        } catch (error) {
            console.error("Error saving test information:", error);
            alert("Error saving test information: " + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Test Information For</h2>
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <ul className="search-results">
                            {filteredOptions.map((option, index) => (
                                <li key={index} onClick={() => {
                                    const video = videoData.find(v => v.compilationName === option);
                                    if (video) {
                                        setSelectedVideo(video);
                                    }
                                    setSearchQuery('');
                                }}>{option}</li>
                            ))}
                        </ul>
                    )}
                    {selectedVideo && (
                        <h3 className="selected-video-label">Selected: {selectedVideo.compilationName}</h3>
                    )}
                </div>
                <table className="test-info-table">
                    <thead>
                    <tr>
                        <th>Version</th>
                        <th>Retention Time</th>
                        <th>Retention Value</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <select value={row.version} onChange={(e) => handleRowChange(idx, 'version', e.target.value)}>
                                    {["V1", "V2", "V3", "V4", "V5"].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </td>
                            <td>
                                <select value={row.retentionTime} onChange={(e) => handleRowChange(idx, 'retentionTime', e.target.value)}>
                                    {["3s", "15s", "30s", "45s"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </td>
                            <td>
                                <input type="number" step="0.01" value={row.retentionValue} onChange={(e) => handleRowChange(idx, 'retentionValue', e.target.value)} />
                            </td>
                            <td>
                                <button className="delete-row-button" onClick={() => handleDeleteRow(idx)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="4">
                            <button
                                className="add-version-button"
                                onClick={handleAddRow}
                                disabled={rows.length >= 24}
                            >
                                Add another version
                            </button>
                        </td>
                    </tr>
                    </tfoot>
                </table>
                <div className="modal-actions">
                    <button className="confirm" onClick={handleSave}>Save</button>
                    <button className="cancel" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddTestInfo;