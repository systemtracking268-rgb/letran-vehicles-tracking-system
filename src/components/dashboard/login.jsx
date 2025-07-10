import React, { useState, useEffect } from 'react';
import User from "./user";
import Admin from './admin';
import Logo from "./images/logo.png";

function Login() {
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState(''); // 'login' | 'user' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Check if user already logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser === 'admin') setCurrentView('admin');
    else if (savedUser) setCurrentView('user');
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple check - replace with your actual auth logic
    if (username.trim().toLowerCase() === 'admin') {
      localStorage.setItem('loggedInUser', 'admin');
      setCurrentView('admin');
    } else {
      localStorage.setItem('loggedInUser', username.trim());
      setCurrentView('user');
    }
  };

  // Show different views
  if (currentView === 'user') return <User />;
  if (currentView === 'admin') return <Admin />;

  return (
    <div className='flex justify-center items-center h-screen bg-gray-900'>
      <div className='rounded-2xl bg-white p-6 w-full max-w-md shadow-md'>
        <div className='flex items-center gap-3 mb-6'>
          <img src={Logo} alt="Logo" className="w-6 h-6" />
          <h1 className='text-xl font-[collegeFont] text-gray-800'>
            {showRegister ? 'Create an Account' : 'Colegio de San Juan de Letran Vehicles'}
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-10 w-full border border-gray-300 text-sm rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full border border-gray-300 text-sm rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {showRegister && (
            <input
              type="email"
              placeholder="Email"
              className="h-10 w-full border border-gray-300 text-sm rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}

          <div className={`flex ${showRegister ? 'flex-col space-y-2' : 'justify-between gap-2'}`}>
            {showRegister ? (
              <>
                <button
                  type="submit"
                  className="text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm px-5 py-2.5"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleBackToLogin}
                  type="button"
                  className="text-white bg-gray-600 hover:bg-gray-700 rounded-lg text-sm px-5 py-2.5"
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm px-5 py-2.5"
                >
                  Login
                </button>
                <button
                  onClick={handleRegisterClick}
                  type="button"
                  className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm px-5 py-2.5"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
