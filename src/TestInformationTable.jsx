import React from 'react';
import './TestInfo.css';

function TestInformationTable({ selectedIds = [], videoData = [] }) {
  // If we have selectedIds, filter to just those videos
  // Otherwise show all videos
  const filteredData = selectedIds.length > 0
      ? videoData.filter(video => selectedIds.includes(video.id))
      : videoData;

  return (
      <div className="test-info-container">
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
                <th>Compilation</th>
                <th>V1</th>
                <th>V2</th>
                <th>V3</th>
                <th>V4</th>
                <th>V5</th>
              </tr>
              </thead>
              <tbody>
              {filteredData
                  .filter(video => video && video.id && video.compilationName)
                  .map((video) => {
                    const mapped = {
                      V1: '-',
                      V2: '-',
                      V3: '-',
                      V4: '-',
                      V5: '-',
                    };

                    // Safely handle tests array
                    if (Array.isArray(video.tests)) {
                      video.tests.forEach((test) => {
                        if (test && Object.prototype.hasOwnProperty.call(mapped, test.version)) {
                          mapped[test.version] = test.retentionValue;
                        }
                      });
                    }

                    return (
                        <tr key={video.id}>
                          <td>{video.compilationName}</td>
                          <td>{mapped.V1}</td>
                          <td>{mapped.V2}</td>
                          <td>{mapped.V3}</td>
                          <td>{mapped.V4}</td>
                          <td>{mapped.V5}</td>
                        </tr>
                    );
                  })}
              </tbody>
            </table>
        )}
      </div>
  );
}

export default TestInformationTable;