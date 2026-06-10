import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('steakz_token', response.data.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-semibold">Steakz MIS Login</h1>
        {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="" />
          </div>
          <button type="submit" className="w-full">Sign in</button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer')}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            🛍️ Open Customer Order Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
