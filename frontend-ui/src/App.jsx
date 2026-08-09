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
import './index.css';

export default function App() {
  const { t } = useTranslation();
  const [active, setActive] = useState('register');
  const [prefill, setPrefill] = useState(null);

  const NAV_ITEMS = [
    { id: 'register', label: t('nav.register'), icon: '⊕' },
    { id: 'search', label: t('nav.search'), icon: '◎' },
    { id: 'owner', label: t('nav.owner'), icon: '◈' },
    { id: 'map', label: t('nav.map'), icon: '⊞' },
    { id: 'transfer', label: t('nav.transfer'), icon: '⇌' },
    { id: 'mutate', label: t('nav.mutate'), icon: '⊗' },
    { id: 'history', label: t('nav.history'), icon: '◷' },
  ];

  const navigateTo = (page, data = null) => {
    setPrefill(data);
    setActive(page);
  };

  const renderPage = () => {
    switch (active) {
      case 'register': return <RegisterLand prefill={prefill} onPrefillUsed={() => setPrefill(null)} />;
      case 'search': return <SearchLand />;
      case 'owner': return <OwnerSearch />;
      case 'map': return <MapView onNavigateRegister={(data) => navigateTo('register', data)} />;
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
          {NAV_ITEMS.map(({ id, label, icon }) => (
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
          <LanguageSwitcher />
          <div className="network-status">
            <div className="status-dot" />
            <span>{t('app.network')}</span>
          </div>
        </div>
      </aside>

      <main className="main-content" key={active}>
        {renderPage()}
      </main>
    </div>
  );
}
