import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logosibbap.png';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('User');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://192.168.254.103:3001/api/auth',
        { userType, email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', userType);

        alert('Login successful!');

        if (userType === 'Member') {
          navigate('/member-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(response.data.error || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Sibbap Logo" className="w-32 sm:w-48" />
        </div>

        {errorMessage && <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">User Type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full border rounded-md py-2 px-3 focus:ring focus:ring-green-300"
              required
            >
              <option value="">Select user</option>
              <option value="Member">Member</option>
              <option value="System admin">System admin</option>
              <option value="General manager">General manager</option>
              <option value="Loan officer">Loan officer</option>
              <option value="Teller">Teller</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md py-2 px-3 focus:ring focus:ring-green-300"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md py-2 px-3 focus:ring focus:ring-green-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
