import React, { useState, useEffect } from 'react';
import User from "./user";
import Logo from "./images/logo.png";
import bus from "./images/bus.jpg";
import letranManila from "./images/letranM.webp";

function Login() {
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError]= useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setError('');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser === 'admin') setCurrentView('admin');
    else if (savedUser) setCurrentView('user');
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    resetFields();
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    resetFields();
    setShowRegister(false);
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(API_URL + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem("loggedInUser", data.user.username);
      setCurrentView("user");
      setError("");
    } else {
      setError(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login request failed:", err);
    setError("Server error, try again later");
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URL + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setError("✅ Registration success. Logging in...");
        
        // small delay before logging in
        setTimeout(() => {
          localStorage.setItem("loggedInUser", data.user.username);
          setCurrentView("user");
          resetFields();
        }, 2000);
      } else {
        setError(data.message || "Register failed");
      }
    } catch (err) {
      console.error("Register request failed:", err);
      setError("Server error, try again later");
    }
  };




  if (currentView === 'user') return <User onLogout={() => { setCurrentView(''); resetFields(); }} />;

  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      <img
        src={letranManila}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 flex bg-white/90 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl h-[70vh]">
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <img src={Logo} alt="Logo" className="w-6 h-6" />
              <h1 className="text-xl font-[collegeFont] text-gray-800">
                {showRegister ? 'Create an Account' : 'Colegio de San Juan de Letran Vehicles'}
              </h1>
            </div>

            {error && (
              <p
                className={`text-sm font-medium mb-3 ${
                  error.startsWith("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}


            <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
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
                  value={email}                    // ✅ linked to state
                  onChange={(e) => setEmail(e.target.value)}  // ✅ update state
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

        <div className="hidden md:flex w-1/2">
          <img
            src={bus}
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
