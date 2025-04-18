import { useState } from 'react';
import axios from 'axios';

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
                alert('Login successful!');
                // optionally redirect or lift state later
            })
            .catch((err) => {
                console.error('Login error:', err);
                setError('Invalid credentials');
            });
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br />
                <button type="submit">Log In</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;