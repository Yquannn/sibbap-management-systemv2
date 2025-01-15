import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logosibbap.png';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('User'); // Default value matches your data
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/auth',
        {
          userType,
          email: trimmedEmail,
          password: trimmedPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Check if response indicates success
      if (response.status === 200) {
        localStorage.setItem('userLoggedIn', true);
        localStorage.setItem('userEmail', email);
        alert('Login successful!');
        // Redirect to home or dashboard after successful login
        navigate('/dashboard'); // Use navigate instead of window.location.href
      } else {
        setErrorMessage(response.data.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);

      const errorMsg =
        error.response?.data?.message ||
        'Invalid email or password';
      setErrorMessage(errorMsg);

     
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center p-6 shadow-md bg-white max-w-2xl w-full rounded-md">
        <img src={logo} alt="Sibbap Logo" className="w-48 h-auto mb-6" />
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded px-8 pt-6 pb-8 mb-4 w-full"
        >
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
          )}
          <div className="mb-4">
            <label
              htmlFor="userType"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              User Type
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer w-full"
              required
            >
              <option value="System admin">System admin</option>
              <option value="General manager">General manager</option>
              <option value="Loan officer">Loan officer</option>
              <option value="Teller">Teller</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
