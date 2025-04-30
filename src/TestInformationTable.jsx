import React from 'react';
import './TestInfo.css';

function TestInformationTable({ videoData = [] }) {
  return (
    <div className="test-info-container">
      {videoData.length === 0 ? (
        <div className="test-info-empty">No test information available.</div>
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
            {videoData
              .filter(video => video && video.id && video.compilationName)
              .map((video) => {
              const mapped = {
                V1: '-',
                V2: '-',
                V3: '-',
                V4: '-',
                V5: '-',
              };

              video.tests?.forEach((test) => {
                if (Object.prototype.hasOwnProperty.call(mapped, test.version)) {
                  mapped[test.version] = test.retentionValue;
                }
              });

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