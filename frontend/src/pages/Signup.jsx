import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 dark:bg-white-900 p-4">
      <div className="bg-white dark:bg-white-800 p-8 rounded-lg shadow-md max-w-md w-full border border-white-200 dark:border-white-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-white-700 dark:border-white-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-white-700 dark:border-white-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-white-700 dark:border-white-600"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">
            Sign Up <UserPlus className="inline w-4 h-4 ml-2" />
          </button>
        </form>
         <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
