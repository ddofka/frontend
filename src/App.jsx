import React, { useState, useEffect, useRef } from 'react';
import Login from './Login';
import VideoList from './VideoList';
import axiosInstance from "./axiosInstance.js";
import AddCompilationModal from "./AddCompilationModal.jsx";
import BulkEditModal from './BulkEditModal';
import TestInformationTable from "./TestInformationTable.jsx";
import './App.css';

function App() {
    const [pageIndex, setPageIndex] = useState(0);  // Default page is 0
    const [pageSize] = useState(10);  // Set the page size (10 videos per page)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [videoData, setVideoData] = useState([]);
    const [totalVideos, setTotalVideos] = useState(0);
    // Function to check token validity
    const checkTokenValidity = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        axiosInstance.get('http://localhost:8080/api/videos?page=0&size=1')
            .then(() => {
                setIsLoggedIn(true); // token valid
            })
            .catch((error) => {
                console.warn('Token ping failed:', error);
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                window.location.href = '/'; // force immediate redirect
            });

    };
    const tableRef = useRef();
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          tableRef.current &&
          !tableRef.current.contains(event.target) &&
          !event.target.closest('[data-ignore-outside-click]')
        ) {
          setSelectedIds([]);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, []);
    useEffect(() => {
        // Initial token check
        checkTokenValidity();

        // Set up periodic token check (every 2 minutes)
        const tokenCheckInterval = setInterval(() => {
            checkTokenValidity();
        }, 1000 * 60 * 60 * 8); // 8 hours in milliseconds

        // Cleanup interval on component unmount
        return () => clearInterval(tokenCheckInterval);
    }, []);

    useEffect(() => {
      const fetchVideos = async () => {
        try {
          const response = await axiosInstance.get(
            `http://localhost:8080/api/videos?page=${pageIndex}&size=${pageSize}&sort=id,desc`
          );
          console.log('Fetched video data:', response.data.content);
          setVideoData(response.data.content || []);
          setTotalVideos(response.data.page.totalElements || 0);
        } catch (error) {
          console.error('Failed to fetch video data:', error);
        }
      };

      fetchVideos();
    }, [refreshTrigger, pageIndex, pageSize]);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true); // switch to video list on successful login
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };


    return (
        <div className="app">
            {isLoggedIn ? (
                <>
                    <div className="header">
                        <button onClick={() => setShowAddModal(true)}
                                className="add-compilation-button"
                        >
                            Add Compilation
                        </button>
                        {selectedIds.length > 0 && (
                            <button onClick={() => setShowBulkEditModal(true)}
                                    className="add-compilation-button"
                                    data-ignore-outside-click="true">
                                Bulk Edit
                            </button>
                        )}
                        <h1>Production Plan App</h1>
                        <button className={"logout"} onClick={handleLogout}>Log Out</button>
                    </div>
                    <div ref={tableRef} className="table-wrapper">
                        <VideoList
                            videoData={videoData}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            setPageIndex={setPageIndex}
                            totalVideos={totalVideos}
                        />
                      <div className="test-info-wrapper">
                          <TestInformationTable selectedIds={selectedIds} videoData={videoData} />
                      </div>
                    </div>
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
            {showAddModal && (
                <AddCompilationModal
                    onClose={() => setShowAddModal(false)}
                    onVideoAdded={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
            {showBulkEditModal && (
              <div data-ignore-outside-click="true">
                <BulkEditModal
                  videoIds={selectedIds}
                  onClose={() => setShowBulkEditModal(false)}
                  onBulkEdited={() => {
                    setRefreshTrigger(prev => prev + 1);
                    setSelectedIds([]);
                  }}
                />
              </div>
            )}
        </div>
    );
}

export default App;
