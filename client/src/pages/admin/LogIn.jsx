import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logosibbap.png';

const LogIn = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check for remembered credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);
  const userType = sessionStorage.getItem('usertype');

  // Redirect when user successfully logs in
  useEffect(() => {
    const userLoggedIn = sessionStorage.getItem('userLoggedIn');
    if (userLoggedIn === 'true' && userType) {
      // Define routes based on user type
      const routeMap = {
        'Member': '/member-dashboard',
        'System Admin': '/dashboard',
        'General Manager': '/dashboard',
        'Treasurer': '/loan-approval',
        'Loan Officer': '/loan-dashboard',
        'Account Officer': '/members',
        'Clerk': '/members'
      };
      
      const targetRoute = routeMap[userType] || '/authorize';
      navigate(targetRoute);
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');

    try {
      // API base URL
      const API_BASE_URL = 'http://192.168.254.100:3001/api';
      
      // Authenticate the user - matches your backend exactly
      const authResponse = await axios.post(
        `${API_BASE_URL}/auth`,
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (authResponse.status === 200 && authResponse.data?.user) {
        const { user } = authResponse.data;
        
        // Store basic session info
        sessionStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userType', user.userType || '');

        // Handle "Remember Me" functionality
        if (rememberMe) {
          sessionStorage.setItem('rememberedEmail', user.email);
        } else {
          sessionStorage.removeItem('rememberedEmail');
        }

        // Now fetch additional user details from the two endpoints as in the original code
        try {
          // Call both endpoints concurrently
          const endpoints = [
            `${API_BASE_URL}/member/email/${user.email}`,
            `${API_BASE_URL}/user/email/${user.email}`
          ];
          const requests = endpoints.map(url => axios.get(url));
          const results = await Promise.allSettled(requests);

          // Filter for successful responses with data
          const validResults = results.filter(
            result =>
              result.status === 'fulfilled' &&
              result.value.status === 200 &&
              result.value.data
          );

          if (validResults.length > 0) {
            // If both endpoints return data, try to prioritize one that is not "Member"
            let chosenResponse = null;
            for (let res of validResults) {
              const data = res.value.data;
              // Try to get the candidate user object from different keys or directly
              const candidate = data.user || data.member || data;
              if (candidate && candidate.userType && candidate.userType !== 'Member') {
                chosenResponse = res.value;
                break;
              }
            }
            if (!chosenResponse) {
              chosenResponse = validResults[0].value;
            }

            // Retrieve the found user from the response data
            const data = chosenResponse.data;
            const foundUser = data.user || data.member || data;

            if (!foundUser) {
              setErrorMessage('User data not found.');
              setLoading(false);
              return;
            }

            localStorage.setItem('userEmail', user.email);
            sessionStorage.setItem('usertype', foundUser.userType || '');
            sessionStorage.setItem('password', foundUser.password || '');
            sessionStorage.setItem('username', foundUser.userName || '');
            sessionStorage.setItem('memberId', foundUser.memberId || '');
            sessionStorage.setItem('userid', foundUser.id);
            
       
            // Success notification
            alert('Login successful!');

            // Redirect based on the user type
            const routeMap = {
              'Member': '/member-dashboard',
              'System Admin': '/dashboard',
              'General Manager': '/dashboard',
              'Treasurer': '/loan-approval',
              'Loan Officer': '/loan-dashboard',
              'Account Officer': '/members',
              'Clerk': '/members'
            };

            const targetRoute = routeMap[foundUser.userType] || '/authorize';
            navigate(targetRoute);
          } else {
            setErrorMessage('Invalid response from server.');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setErrorMessage('Error retrieving user information. Please try again.');
        }
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage(
        error.response?.data?.error || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-50 to-green-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg transition-all">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Sibbap Logo" className="w-40 h-auto" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                type="text"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
                required
                // autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#forgot-password" className="font-medium text-green-600 hover:text-green-500">
                Forgot password?
              </a>
            </div>
          </div> */}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;