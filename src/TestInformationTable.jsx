import React, { useState} from 'react';
import AddTestInfo from './AddTestInfo';
import './TestInfo.css';

function TestInformationTable({ selectedIds = [], videoData = [], refreshData }) {
  const [showAddTestInfoModal, setShowAddTestInfoModal] = useState(false);
  const [activeVersion, setActiveVersion] = useState("V1");
  const retentionOptions = ["3s", "15s", "30s", "45s"];

  // Use exact same data as VideoList - show either selected videos or display the current page of videos
  const filteredData = Array.isArray(videoData)
      ? (selectedIds.length > 0
          ? videoData.filter(video => selectedIds.includes(video.id))
          : videoData)
      : [];

  console.log("Filtered data for TestInformationTable:", filteredData);

  return (
      <div className="test-info-container">
        <div className="test-info-header">
          <button className="test-info-button" onClick={() => setShowAddTestInfoModal(true)}>
            Test Information - Add/Update/Clear
          </button>
        </div>
        {filteredData.length === 0 ? (
            <div className="test-info-empty">
              {selectedIds.length > 0
                  ? "No test information available for selected items."
                  : "No test information available."}
            </div>
        ) : (
            <table className="test-info-table">
              <thead>
              <tr>
                <th>Compilation Name</th>
                {["V1", "V2", "V3", "V4", "V5"].map((v) => (
                    <th
                        key={v}
                        className={`cursor-pointer version-header ${activeVersion === v ? "active-version" : "dimmed"}`}
                        onClick={() => setActiveVersion(v)}
                    >
                      {v}
                    </th>
                ))}
              </tr>
              <tr>
                <th>Retention Time</th>
                {retentionOptions.map((opt) =>
                    <th key={opt}>{opt}</th>
                )}
                <th>Winning Version</th>
              </tr>
              </thead>
              <tbody>
              {filteredData.map((video) => {
                const mapped = {
                  compilationName: video.compilationName,
                  versions: {
                    V1: {},
                    V2: {},
                    V3: {},
                    V4: {},
                    V5: {},
                  },
                };

                if (Array.isArray(video.tests)) {
                  video.tests.forEach((test) => {
                    if (
                        test &&
                        test.version &&
                        mapped.versions[test.version] !== undefined &&
                        test.retentionTime
                    ) {
                      mapped.versions[test.version][test.retentionTime] = test.retentionValue;
                    }
                  });
                }

                let winningVersion = "-";
                let bestValue = -Infinity;
                ["V1", "V2", "V3", "V4", "V5"].forEach((v) => {
                  const val = mapped.versions[v]["30s"];
                  if (typeof val === "number" && val > bestValue) {
                    bestValue = val;
                    winningVersion = v;
                  }
                });

                return (
                    <tr key={video.id}>
                      <td>{mapped.compilationName}</td>
                      {retentionOptions.map((opt) => (
                          <td key={opt}>
                            {mapped.versions?.[activeVersion]?.[opt] ?? "-"}
                          </td>
                      ))}
                      <td>{winningVersion}</td>
                    </tr>
                );
              })}
              </tbody>
            </table>
        )}
        <AddTestInfo
            isOpen={showAddTestInfoModal}
            onClose={() => setShowAddTestInfoModal(false)}
            videoData={videoData}
            refreshData={refreshData}
        />
      </div>
  );
}

export default TestInformationTable;