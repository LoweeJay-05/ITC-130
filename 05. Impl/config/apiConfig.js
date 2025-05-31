// API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.156.209:5000';

// Fallback URLs in case the main URL doesn't work
const FALLBACK_URLS = [
  'http://192.168.156.209:5000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

export { API_BASE_URL, FALLBACK_URLS };
export default API_BASE_URL;
