// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const { login: doLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !email.trim() || !password) {
      setErr('Name, email and password required');
      return;
    }
    setLoading(true);
    try {
      // apiRegister returns { token, user }
      const res = await apiRegister(name.trim(), email.trim(), password);
      if (!res || !res.token) {
        setErr('Registration failed');
        setLoading(false);
        return;
      }
      // log user in via context
      doLogin(res.token, res.user);
    } catch (error) {
      console.error('Register error', error);
      const msg = error?.response?.data?.message || 'Registration failed';
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>

        {err && <div className="mb-3 text-red-600">{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

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
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
        </div>
      </div>
    </div>
  );
}
