import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background radial glow for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-yellow-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="md:pl-64 flex flex-col min-h-screen">
          <Topbar onMenuClick={() => setMobileOpen(prev => !prev)} />
          <main className="flex-1 p-4 md:p-8 lg:p-10">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
