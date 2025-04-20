import axios from 'axios';

// In your .env (at project root):
// REACT_APP_API_BASE_URL=http://localhost:3001

const API_BASE_URL = "http://localhost:3001"; // process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const fetchInterestRates = (moduleId) => {
  if (!moduleId) {
    throw new Error('fetchInterestRates: moduleId is required');
  }
  return axios.get(`${API_BASE_URL}/api/time-deposit/${moduleId}`);
};
