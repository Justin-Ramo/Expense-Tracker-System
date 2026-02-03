import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = ({ setSessionId }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                const response = await axios.post(
                    'http://localhost:5000/api/login',
                    { username, password }
                );

                console.log('LOGIN RESPONSE:', response.data);

                if (response.data.sessionId) {
                    setSessionId(response.data.sessionId);
                    navigate('/expenseTracker');
                } else {
                    alert('Login failed');
                }
            } else {
                const response = await axios.post(
                    'http://localhost:5000/api/register',
                    { username, password, email }
                );

                console.log('REGISTER RESPONSE:', response.data);
                setSuccessMessage('Registered successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setIsLogin(true);
            }
        } catch (error) {
            if (error.response) {
                console.error('Server error:', error.response.data);
                alert(error.response.data.message || error.response.data.error);
            } else {
                console.error('Network error:', error.message);
                alert('Cannot connect to server');
            }
        }
    };

    return (
        <div className="container">
            <div className="auth-container">
                {successMessage && (
                    <div className="notification">{successMessage}</div>
                )}

                <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    {!isLogin && (
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <button
                    className="toggle-button"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Switch to Sign Up' : 'Switch to Sign In'}
                </button>
            </div>
        </div>
    );
};

export default Auth;
