import { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login({ onLoginSuccess }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/api/auth/login', {
            username,
            password
        })
            .then((response) => {
                const token = response.data.token;
                localStorage.setItem('token', token); // save token for other components
                setError('');
                onLoginSuccess(); // tell App to switch
            })
            .catch((err) => {
                console.error('Login error:', err);
                setError('Invalid credentials');
            });
    };

    return (
        <div className="login-page">
            <div className="login">
                {error && <p>Access denied, but points for creativity.</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">log-in</button>
                </form>
            </div>
        </div>
    );
}

export default Login;