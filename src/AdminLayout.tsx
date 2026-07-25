import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { DashboardIcon, PackageIcon, PlusIcon, LogOutIcon, MenuIcon, ChevronDownIcon, UserIcon } from './lib/icons';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    end: true,
    icon: <DashboardIcon size={20} />,
  },
  {
    name: 'Products',
    href: '/admin/products',
    end: false,
    icon: <PackageIcon size={20} />,
  },
  {
    name: 'Add Paddle',
    href: '/admin/products/add',
    end: true,
    icon: <PlusIcon size={20} />,
  },
];

const pageMeta: Record<string, { title: string; description: string }> = {
  '/admin': { title: 'Dashboard', description: 'Overview of your paddle inventory' },
  '/admin/products': { title: 'Products', description: 'Manage your paddle catalog' },
  '/admin/products/add': { title: 'Add Paddle', description: 'Add a new product to your catalog' },
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminInitial, setAdminInitial] = useState<string>('A');
  const [profileDropdown, setProfileDropdown] = useState(false);

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
        setAdminInitial(user.email.charAt(0).toUpperCase());
      }
    };
    getEmail();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const pageKey = '/' + location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
  const meta = pageMeta[pageKey] || pageMeta[location.pathname] || { title: 'Admin', description: '' };

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full min-w-0">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-[#0f172a] text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">PD</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate leading-tight">Paddle Depot</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full" />
                  )}
                  <span className={`flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Admin Profile + Logout */}
        <div className="p-3 border-t border-white/10">
          {adminEmail && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-emerald-400">
                {adminInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate leading-tight">Admin</p>
                <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Sign out"
          >
            <LogOutIcon size={20} className="flex-shrink-0 text-gray-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0 lg:pl-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile menu + page info */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <MenuIcon size={24} />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{meta.title}</h2>
                {meta.description && (
                  <p className="text-xs text-gray-500 hidden sm:block">{meta.description}</p>
                )}
              </div>
            </div>

            {/* Right: Admin profile */}
            <div className="flex items-center gap-3">
              {adminEmail && (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Admin profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                      <UserIcon size={14} />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[120px]">
                      {adminEmail}
                    </span>
                    <ChevronDownIcon size={14} className={`text-gray-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {profileDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 w-48 origin-top-right">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-900 truncate">{adminEmail}</p>
                          <p className="text-[10px] text-gray-400">Administrator</p>
                        </div>
                        <button
                          onClick={() => { handleLogout(); setProfileDropdown(false); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOutIcon size={14} className="text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 w-full">
          <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
