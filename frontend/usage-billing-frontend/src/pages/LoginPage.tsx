import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: (username: string, role: string) => void;
  logoutMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, logoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Wrong username or password');
        return;
      }

      onLoginSuccess(data.username, data.role);
    } catch (err) {
      setError('Wrong username or password');
    }
  };

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center">
      {logoutMessage && (
        <div className="alert alert-success fw-bold text-center mb-3">
          {logoutMessage}
        </div>
      )}

      <div className="cyan-box p-4 rounded shadow" style={{ width: '380px' }}>
        <h3 className="text-center fw-bold mb-4">BILLING SYSTEM</h3>

        {error && <div className="alert alert-danger py-2 text-center small fw-semibold">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 row">
            <label className="col-4 col-form-label fw-bold">Username:</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-2 row">
            <label className="col-4 col-form-label fw-bold">Password:</label>
            <div className="col-8">
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="text-end mb-3">
            <a href="#forgot" className="small text-primary">Forgot Password ?</a>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary fw-bold px-4">
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};