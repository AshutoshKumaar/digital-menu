'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../firebase/config'; // ✅ your real Firebase config
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ✅ Regions list
const REGIONS = [
  'East Delhi',
  'West Delhi',
  'South Mumbai',
  'North Bangalore',
  'Jaipur Central',
];

// ✅ Global font loader
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

const Register = () => {
  const router = useRouter();

  // form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [assignedRegion, setAssignedRegion] = useState(REGIONS[0]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      setError('Mobile number must be a valid 10-digit number.');
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Create user profile in Firestore
      await setDoc(doc(db, 'salespersons', user.uid), {
        name,
        email,
        mobile,
        assignedRegion,
        walletBalance: 0.0,
        role: 'salesperson',
        createdAt: serverTimestamp(),
      });

      router.push('/staff-dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
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
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100 transform transition duration-500 ease-in-out">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-2">
          New Staff Onboarding
        </h1>
        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Sign up to access your Sales Panel.
        </p>

        {error && (
          <div
            className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 transition duration-300"
            role="alert"
          >
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
          <InputGroup
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Karan Sharma"
          />

          <InputGroup
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="karan@sales.com"
          />

          <InputGroup
            id="mobile"
            label="Mobile Number (10 digits)"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="9876543210"
            maxLength="10"
          />

          {/* Region Dropdown */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Region
            </label>
            <select
              id="region"
              value={assignedRegion}
              onChange={(e) => setAssignedRegion(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 cursor-pointer text-base"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputGroup
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />

            <InputGroup
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>

          {/* Register Button */}
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0
                   c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Register Salesperson'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1 transition duration-300"
          >
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

// ✅ Reusable Input Component
const InputGroup = ({ id, label, type, value, onChange, placeholder, maxLength }) => (
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
      maxLength={maxLength}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 text-base"
    />
  </div>
);

export default Register;
