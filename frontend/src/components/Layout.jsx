import Header from './Header';
import Footer from './Footer';

function Layout({ user, onLogout, currentPage, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Header user={user} onLogout={onLogout} currentPage={currentPage} onNavigate={onNavigate} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
