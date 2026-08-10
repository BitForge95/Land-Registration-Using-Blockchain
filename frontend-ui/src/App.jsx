import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RegisterLand from './components/RegisterLand';
import SearchLand from './components/SearchLand';
import OwnerSearch from './components/OwnerSearch';
import TransferLand from './components/TransferLand';
import MutateLand from './components/MutateLand';
import AssetHistory from './components/AssetHistory';
import MapView from "./components/Mapview";
import LanguageSwitcher from './components/LanguageSwitcher';
import AuthPage from './components/AuthPage';
import { useAuth } from './context/auth-context';
import './index.css';

/** Page a citizen lands on, and the fallback when an admin-only page is unreachable. */
const DEFAULT_PAGE = 'search';

export default function App() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, username, role, signOut } = useAuth();
  const [active, setActive] = useState(DEFAULT_PAGE);
  const [prefill, setPrefill] = useState(null);

  // `adminOnly` marks the operations that write to the ledger, plus the
  // registry-wide owner search. Citizens get lookup and audit only.
  const NAV_ITEMS = [
    { id: 'register', label: t('nav.register'), icon: '⊕', adminOnly: true },
    { id: 'search', label: t('nav.search'), icon: '◎' },
    { id: 'owner', label: t('nav.owner'), icon: '◈', adminOnly: true },
    { id: 'map', label: t('nav.map'), icon: '⊞' },
    { id: 'transfer', label: t('nav.transfer'), icon: '⇌', adminOnly: true },
    { id: 'mutate', label: t('nav.mutate'), icon: '⊗', adminOnly: true },
    { id: 'history', label: t('nav.history'), icon: '◷' },
  ];

  const visibleNavItems = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);

  const navigateTo = (page, data = null) => {
    setPrefill(data);
    setActive(page);
  };

  const handleSignOut = () => {
    // Drop any in-flight page state so the next person to sign in starts clean.
    setActive(DEFAULT_PAGE);
    setPrefill(null);
    signOut();
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderPage = () => {
    // Belt and braces: even if `active` somehow points at an admin page, a
    // citizen never gets it rendered.
    const target = NAV_ITEMS.find((item) => item.id === active);
    const page = !target || (target.adminOnly && !isAdmin) ? DEFAULT_PAGE : active;

    switch (page) {
      case 'register': return <RegisterLand prefill={prefill} onPrefillUsed={() => setPrefill(null)} />;
      case 'search': return <SearchLand />;
      case 'owner': return <OwnerSearch />;
      case 'map': return <MapView onNavigateRegister={isAdmin ? (data) => navigateTo('register', data) : null} />;
      case 'transfer': return <TransferLand />;
      case 'mutate': return <MutateLand />;
      case 'history': return <AssetHistory />;
      default: return null;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="tricolor-bar" />
        <div className="sidebar-logo">
          <div className="logo-emblem">⊛</div>
          <div className="logo-name">{t('app.title')}</div>
          <div className="logo-dept">{t('app.dept')}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{t('nav.section')}</div>
          {visibleNavItems.map(({ id, label, icon }) => (
            <div
              key={id}
              className={`nav-item${active === id ? ' active' : ''}`}
              onClick={() => navigateTo(id)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-chip-info">
              <span className="user-chip-name">{username}</span>
              <span className={`role-badge role-badge-${isAdmin ? 'admin' : 'user'}`}>
                {isAdmin ? t('auth.roleAdmin') : t('auth.roleUser')}
              </span>
            </div>
            <button type="button" className="btn-ghost" onClick={handleSignOut}>
              {t('auth.signOut')}
            </button>
          </div>

          <LanguageSwitcher />
          <div className="network-status">
            <div className="status-dot" />
            <span>{t('app.network')}</span>
          </div>
        </div>
      </aside>

      <main className="main-content" key={`${role}-${active}`}>
        {renderPage()}
      </main>
    </div>
  );
}
