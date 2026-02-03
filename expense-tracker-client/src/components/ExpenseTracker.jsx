// src/components/ExpenseTracker.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpenseTracker.css'; 

const ExpenseTracker = ({ sessionId }) => {
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [editingExpenseId, setEditingExpenseId] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/expenses', {
                headers: { Authorization: sessionId }
            });
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            const newExpense = { description, amount, date };
            await axios.post('http://localhost:5000/api/expenses', newExpense, {
                headers: { Authorization: sessionId }
            });
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const updateExpense = async (e) => {
        e.preventDefault();
        try {
            const updatedExpense = { description, amount, date };
            await axios.put(`http://localhost:5000/api/expenses/${editingExpenseId}`, updatedExpense, {
                headers: { Authorization: sessionId }
            });
            fetchExpenses();
            resetForm();
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
                headers: { Authorization: sessionId }
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setDate('');
        setEditingExpenseId(null);
    };

    const handleEdit = (expense) => {
        setDescription(expense.description);
        setAmount(expense.amount);
        setDate(expense.date);
        setEditingExpenseId(expense.id);
    };

    return (
        <div className="expense-tracker-container">
            <h2>Expense Tracker</h2>
            <form onSubmit={editingExpenseId ? updateExpense : addExpense}>
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <button type="submit">{editingExpenseId ? 'Update Expense' : 'Add Expense'}</button>
                {editingExpenseId && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>
            <h3>Your Expenses</h3>
            <table className="expense-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.description}</td>
                            <td>${expense.amount}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(expense)}>Edit</button>
                                <button className="delete-button" onClick={() => deleteExpense(expense.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseTracker;