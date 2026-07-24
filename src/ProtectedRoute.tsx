import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Demo mode: check localStorage
      if (!isSupabaseConfigured) {
        const demoSession = localStorage.getItem('demo_admin_session');
        if (demoSession === 'true') {
          setSession({ user: { email: 'admin@demo.com' } });
          setIsAdmin(true);
        }
        setLoading(false);
        return;
      }

      // Real Supabase mode
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      setSession(session);

      // Check if the user's email is in the admin allowlist
      const userEmail = session.user?.email;
      if (userEmail) {
        const { data: adminRecord } = await supabase
          .from('admin_allowlist')
          .select('email')
          .eq('email', userEmail)
          .maybeSingle();

        if (adminRecord) {
          setIsAdmin(true);
        }
      }

      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not an admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-2">
            Your account <strong>{session.user?.email}</strong> is not authorized to access the admin panel.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Only designated admin accounts can manage products.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/admin/login';
            }}
            className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Logged in AND confirmed as admin
  return <>{children}</>;
}

