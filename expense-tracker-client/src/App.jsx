import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth.jsx';
import ExpenseTracker from './components/ExpenseTracker.jsx';

const App = () => {
    const [sessionId, setSessionId] = useState(null); // Ensure this is null initially

    return (
        <Router>
            <div>
                <h1>Expense Tracker</h1>
                <Routes>
                    <Route path="/" element={<Auth setSessionId={setSessionId} />} />
                    <Route path="/expenseTracker" element={<ExpenseTracker sessionId={sessionId} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;