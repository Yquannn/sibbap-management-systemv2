import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logosibbap.png';

const LogIn = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const navigate = useNavigate();

  // Redirect when redirectPath is set
  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [redirectPath, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      // Step 1: Authenticate the user using email and password
      const authResponse = await axios.post(
        'http://192.168.254.104:3001/api/auth',
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Auth Response:', authResponse.data);

      if (authResponse.status === 200 && authResponse.data?.user) {
        const { user } = authResponse.data;

        // Store basic user details in session storage
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);

        // Step 2: Fetch additional user data using the provided endpoint
        const userEndpoint = `http://localhost:3001/api/user/email/${user.email}`;
        const userResponse = await axios.get(userEndpoint);

        console.log('User Data Response:', userResponse.data);

        if (userResponse.status === 200 && userResponse.data) {
          // Assuming your API returns an object with userName, userType, and password
          sessionStorage.setItem('username', userResponse.data.userName || 'Unknown User');
          sessionStorage.setItem('usertype', userResponse.data.userType);
          sessionStorage.setItem('password', userResponse.data.password);
        }

        alert('Login successful!');

        // Redirect based on userType
        switch (user.userType) {
          case 'Member':
            setRedirectPath('/member-dashboard');
            break;
          case 'System Admin':
            setRedirectPath('/dashboard');
            break;
          case 'Treasurer':
            setRedirectPath('/loan-approval');
            break;
          case 'Loan Manager':
            setRedirectPath('/apply-for-loan');
            break;
          case 'Teller':
            setRedirectPath('/dashboard');
            break;
          default:
            setRedirectPath('/');
            break;
        }
      } else {
        setErrorMessage('Invalid response from server.');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error);
      setErrorMessage(
        error.response?.data?.error || 'Invalid email or password'
      );
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Sibbap Logo" className="w-32 sm:w-48" />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Email
            </label>
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
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Password
            </label>
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
            disabled={loading}
            className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
