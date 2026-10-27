import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import BatchDetail from './pages/BatchDetail';
import CuppingLab from './pages/CuppingLab';
import CreateLot from './pages/CreateLot';
import OrdersEscrow from './pages/OrdersEscrow';
import Analytics from './pages/Analytics';
import LoginRegister from './pages/LoginRegister';

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const handleSelectLot = (lot) => {
    setSelectedBatchId(lot._id);
    setActivePage('batchDetail');
  };

  const handleLotCupped = (lotId) => {
    setSelectedBatchId(lotId);
    setActivePage('batchDetail');
  };

  const handleLotCreated = (lotId) => {
    setSelectedBatchId(lotId);
    setActivePage('batchDetail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-roast-bg text-roast-textLight font-sans">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activePage === 'dashboard' && (
          <Dashboard
            setActivePage={setActivePage}
            onSelectLot={handleSelectLot}
          />
        )}

        {activePage === 'marketplace' && (
          <Marketplace onSelectLot={handleSelectLot} />
        )}

        {activePage === 'batchDetail' && (
          <BatchDetail
            batchId={selectedBatchId}
            onBack={() => setActivePage('marketplace')}
          />
        )}

        {activePage === 'cupping' && (
          <CuppingLab onLotCupped={handleLotCupped} />
        )}

        {activePage === 'createLot' && (
          <CreateLot onLotCreated={handleLotCreated} />
        )}

        {activePage === 'orders' && <OrdersEscrow />}

        {activePage === 'analytics' && <Analytics />}

        {activePage === 'login' && (
          <LoginRegister onAuthSuccess={() => setActivePage('dashboard')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-palette-amber/20 bg-[#0F0703] py-8 text-xs text-[#8C6239]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-palette-gold" />
            <span className="font-bold text-palette-cream">AMBERROAST OS</span>
            <span>— Specialty Coffee Allocation & Cupping Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[#B8A490]">
            <span>MERN Stack (MongoDB, Express, React, Node)</span>
            <span>•</span>
            <span>TailwindCSS</span>
            <span>•</span>
            <span className="text-palette-gold font-bold">End-Term Software Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
