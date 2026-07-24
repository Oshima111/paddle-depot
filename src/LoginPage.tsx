import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { useState } from 'react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (data: any) => {
    setAuthError(null);

    // === Production Diagnostic Logs ===
    console.log("[Auth] Supabase configured:", isSupabaseConfigured);
    console.log("[Auth] Login attempt email:", data.email);

    // Demo mode: allow access without Supabase
    if (!isSupabaseConfigured) {
      console.warn("[Auth] Supabase not configured — falling back to demo mode.");
      if (data.email === 'admin@demo.com' && data.password === 'admin') {
        localStorage.setItem('demo_admin_session', 'true');
        navigate('/admin');
        return;
      } else {
        setAuthError('Demo mode: Use admin@demo.com / admin');
        return;
      }
    }

    setIsLoading(true);

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

    console.log("[Auth] Sign-in response received, fetching user...");

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    console.log("[Auth] Authenticated user:", user?.email);
    console.log("[Auth] Authenticated user ID:", user?.id);

    if (user) {
      console.log("[Auth] User email confirmed:", !!(user.email_confirmed_at || user.confirmed_at));
    }

    // Verify the user is in the admin allowlist
    const isAdmin = await checkAdminStatus(data.email);

    if (!isAdmin) {
      console.warn("[Auth] User NOT in admin_allowlist, signing out:", data.email);
      // Sign out immediately since this user is not an admin
      await supabase.auth.signOut();
      setAuthError(
        'Access denied. Your account "' +
          data.email +
          '" is not authorized as an admin. Please contact the site owner.'
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
          {!isSupabaseConfigured && (
            <div className="mt-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2">
              Demo Mode - use <strong>admin@demo.com</strong> / <strong>admin</strong>
            </div>
          )}
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
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message as string}</p>}
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
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message as string}</p>}
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

