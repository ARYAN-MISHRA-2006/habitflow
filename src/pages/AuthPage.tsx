import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const {
    loginWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(
          name.trim(),
          email.trim(),
          password
        );

        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setSuccessMsg(res.message);
        } else {
          setSuccessMsg(
            'Account created successfully! Signing you in...'
          );
        }
      } else {
        const res = await loginWithEmail(
          email.trim(),
          password
        );

        if (res.error) {
          if (
            res.error
              .toLowerCase()
              .includes('invalid login credentials')
          ) {
            setErrorMsg(
              'Invalid email or password. If you do not have an account, click "Create Account" above.'
            );
          } else {
            setErrorMsg(res.error);
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);

      setErrorMsg(
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">

        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <Sparkles size={26} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            HabitFlow
          </h1>

          <p className="text-xs font-semibold text-slate-400 mt-1">
            Build consistency. See your progress.
          </p>
        </div>

        {/* Sign In / Create Account Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              !isSignUp
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all ${
              isSignUp
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-xs"
        >

          {/* Name - Sign Up Only */}
          {isSignUp && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password *
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {isSignUp && (
              <p className="text-[10px] text-slate-400 mt-1">
                Password must be at least 6 characters.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-98 transition-all"
          >
            {loading
              ? 'Processing...'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 leading-relaxed">
          {isSignUp
            ? 'Create your personal HabitFlow account and start building consistency.'
            : 'Sign in to access your personal habits and progress.'}
        </p>
      </div>
    </div>
  );
};