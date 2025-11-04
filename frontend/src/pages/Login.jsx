// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login: doLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr('Email and password required');
      return;
    }
    setLoading(true);
    try {
      // apiLogin returns { token, user }
      const res = await apiLogin(email.trim(), password);
      if (!res || !res.token) {
        setErr('Login failed');
        setLoading(false);
        return;
      }
      // use AuthContext login helper
      doLogin(res.token, res.user);
    } catch (error) {
      console.error('Login error', error);
      // friendly message
      const msg = error?.response?.data?.message || 'Login failed';
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Log in</h2>

        {err && <div className="mb-3 text-red-600">{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          Don't have an account? <Link to="/register" className="text-indigo-600">Register</Link>
        </div>
      </div>
    </div>
  );
}
