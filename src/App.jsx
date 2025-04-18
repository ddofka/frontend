import { useState, useEffect } from 'react';
import Login from './Login';
import VideoList from './VideoList';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // true if token exists
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true); // switch to video list on successful login
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    return (
        <div>
            <h1>Production Plan App</h1>
            {isLoggedIn ? (
                <>
                    <button onClick={handleLogout}>Log Out</button>
                    <VideoList />
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;
