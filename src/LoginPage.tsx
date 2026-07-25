import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useState } from 'react';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase env vars are available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

  // If not configured, show a static configuration error (no demo mode fallback)
  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Configuration Error</h2>
          <p className="text-sm text-gray-500">
            Authentication is currently unavailable. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_allowlist')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Failed to verify admin status:', err);
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    setIsLoading(true);

    console.log("[Auth] Attempting Supabase login for:", data.email);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("[Auth] Supabase login error:", error.message);
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    console.log("[Auth] Supabase login successful, verifying admin status...");

    // Verify the user is in the admin allowlist
    const isAdmin = await checkAdminStatus(data.email);

    if (!isAdmin) {
      console.warn("[Auth] User NOT in admin_allowlist:", data.email);
      // Sign out immediately since this user is not an admin
      await supabase.auth.signOut();
      setAuthError(
        'Access denied. Your account is not authorized to access the Admin Dashboard.'
      );
      setIsLoading(false);
      return;
    }

    console.log("[Auth] Admin access granted for:", data.email);
    navigate('/admin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img src="/paddle-depot-logo.png" alt="Paddle Depot" className="w-16 h-16 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in with your Supabase account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              {...register('password', { required: 'Password is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
          {authError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 whitespace-pre-wrap">
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

