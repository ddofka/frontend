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
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [showAddModal, setShowAddModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);
    const [videoData, setVideoData] = useState([]);
    // Removed separate allVideoData state - we'll use the same videoData for both tables
    const [totalVideos, setTotalVideos] = useState(0);

    // Function to check token validity
    const checkTokenValidity = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return;
        }

        axiosInstance.get('http://localhost:8080/api/videos?page=0&size=1')
            .then(() => {
                setIsLoggedIn(true); // token valid
                setIsLoading(false);
            })
            .catch((error) => {
                console.warn('Token ping failed:', error);
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                setIsLoading(false);
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

        // Set up periodic token check (every 8 hours)
        const tokenCheckInterval = setInterval(() => {
            checkTokenValidity();
        }, 1000 * 60 * 60 * 8); // 8 hours in milliseconds

        // Cleanup interval on component unmount
        return () => clearInterval(tokenCheckInterval);
    }, []);

    // Fetch paginated data for VideoList
    useEffect(() => {
        const fetchPaginatedVideos = async () => {
            if (!isLoggedIn) return;

            try {
                setIsLoading(true);
                const response = await axiosInstance.get(
                    `http://localhost:8080/api/videos?page=${pageIndex}&size=${pageSize}&sort=id,desc`
                );
                console.log('Fetched paginated video data for page', pageIndex, ':', response.data);

                // Make sure we're getting data for the current page
                if (response.data && response.data.content) {
                    setVideoData(response.data.content);
                    setTotalVideos(response.data.page.totalElements || 0);
                } else {
                    console.error('Unexpected API response format:', response.data);
                    setVideoData([]);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch paginated video data:', error);
                setVideoData([]);
                setIsLoading(false);
            }
        };

        fetchPaginatedVideos();
    }, [refreshTrigger, pageIndex, pageSize, isLoggedIn]);

    // Removed the separate fetch for all videos - using the same data source for both tables

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        // Wait for state to update before triggering data fetches
        setTimeout(() => setRefreshTrigger(prev => prev + 1), 100);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setVideoData([]);
        // Removed setAllVideoData call
    };

    const handleDataRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="app">
            {isLoading ? (
                <div className="loading-container">
                    <p>Loading...</p>
                </div>
            ) : isLoggedIn ? (
                <>
                    <div className="header">
                        <div className="button-group">
                            <button onClick={() => setShowAddModal(true)} className="add-compilation-button">Add Compilation</button>
                            {selectedIds.length > 0 && (
                                <button onClick={() => setShowBulkEditModal(true)} className="add-compilation-button" data-ignore-outside-click="true">
                                    Bulk Edit
                                </button>
                            )}
                        </div>
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
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onVideoUpdated={handleDataRefresh}
                        />
                        <div className="test-info-wrapper">
                            <TestInformationTable
                                selectedIds={selectedIds}
                                videoData={videoData}  // Use the exact same videoData as VideoList
                                refreshData={handleDataRefresh}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
            {showAddModal && (
                <AddCompilationModal
                    onClose={() => setShowAddModal(false)}
                    onVideoAdded={handleDataRefresh}
                />
            )}
            {showBulkEditModal && (
                <div data-ignore-outside-click="true">
                    <BulkEditModal
                        videoIds={selectedIds}
                        onClose={() => setShowBulkEditModal(false)}
                        onBulkEdited={() => {
                            handleDataRefresh();
                            setSelectedIds([]);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default App;