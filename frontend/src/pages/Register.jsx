import React, { useState } from 'react';
import { register } from '../api/auth';
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
    setLoading(true);
    try {
      const data = await register(name, email, password);
      if (data.token) {
        doLogin(data.token, data.user);
      }
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>
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
