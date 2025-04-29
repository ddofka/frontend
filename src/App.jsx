import React, { useState, useEffect } from 'react';
import Login from './Login';
import VideoList from './VideoList';
import axiosInstance from "./axiosInstance.js";
import AddCompilationModal from "./AddCompilationModal.jsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
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
                        <h1>Production Plan App</h1>
                        <button className={"logout"} onClick={handleLogout}>Log Out</button>
                    </div>
                    <VideoList refreshTrigger={refreshTrigger} />
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
            {showAddModal && (
                <AddCompilationModal
                    onClose={() => setShowAddModal(false)}
                    onVideoAdded={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}fina
        </div>
    );
}

export default App;
