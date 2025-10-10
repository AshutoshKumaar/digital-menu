'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config'; // ✅ your real Firebase config

// ✅ Font loader (same as Register page)
const MooliFontLoader = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Mooli&display=swap');
    body, * {
      font-family: 'Mooli', sans-serif !important;
    }
    .space-y-5 > * {
      margin-top: 1.25rem;
    }
    .space-y-5 > *:first-child {
      margin-top: 0;
    }
  `}</style>
);

export default function Login() {
  const router = useRouter();

  // states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // login function
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ✅ Firebase login
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ redirect
      router.push('staff-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 sm:p-8">
      <MooliFontLoader />
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 transition duration-500 ease-in-out">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-2">
          Staff Login
        </h1>
        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Welcome back! Please log in to continue.
        </p>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 transition duration-300"
            role="alert"
          >
            <span className="font-semibold">Error: </span>{error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white transition duration-300 ease-in-out transform hover:scale-[1.01] ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                  5.291A7.962 7.962 0 014 12H0c0 3.042 
                  1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New to the system?
          <Link
            href="/register"
            className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1 transition duration-300"
          >
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}

// ✅ Reusable Input Component
const InputGroup = ({ id, label, type, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 text-base"
    />
  </div>
);
