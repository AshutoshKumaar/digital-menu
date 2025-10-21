'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import {Josefin_Sans} from 'next/font/google'


const josefin = Josefin_Sans({ subsets: ['latin'],});


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (agentCode.trim() !== 'AGENT123') {
      setError('Invalid Agent Code. Please contact your admin.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('staff-dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found')
        setError('No account found with this email.');
      else if (err.code === 'auth/wrong-password')
        setError('Incorrect password.');
      else setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={josefin.className}>
      <nav className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </nav>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 px-4 pt-30 pb-5">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
            Staff Login
          </h1>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Welcome back! Please log in to continue.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <InputGroup
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="karan@sales.com"
            />
            <InputGroup
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <InputGroup
              id="agentCode"
              label="Agent Code"
              type="text"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              placeholder="Enter your agent code"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 rounded-lg font-bold text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300'
              }`}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            New to the system?
            <Link
              href="/staff-registration"
              className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const InputGroup = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
    />
  </div>
);
