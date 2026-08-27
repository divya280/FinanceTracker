import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { SignIn, Wallet, Eye, EyeSlash } from '@phosphor-icons/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-md w-full border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-full gradient-primary mb-3 shadow-lg shadow-primary/30">
            <Wallet className="w-6 h-6 text-white" weight="duotone" />
          </div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground text-sm">Log in to FinanceTracker</p>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pr-10 rounded-md border border-input bg-background"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeSlash className="w-4 h-4" weight="bold" /> : <Eye className="w-4 h-4" weight="bold" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 font-medium flex items-center justify-center gap-2"
          >
            Log In <SignIn className="w-4 h-4" weight="bold" />
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/signup" className="text-primary hover:underline text-sm">Need an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
