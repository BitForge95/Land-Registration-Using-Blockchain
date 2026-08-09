import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLandByOwner } from '../services/api';
import LandRecord from './LandRecord';

export default function OwnerSearch() {
  const { t } = useTranslation();
  const [ownerId, setOwnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const onSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const data = await getLandByOwner(ownerId.trim());
      // API may return either parsed JSON or a JSON-encoded string.
      const list = Array.isArray(data) ? data : JSON.parse(data);
      setResults(list);
    } catch (err) {
      setError(t('owner.queryFailed', { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('owner.title')}</h1>
        <p className="page-subtitle">{t('owner.subtitle')}</p>
      </div>

      <div className="card">
        <div className="card-title">
          <span>◈</span> {t('owner.cardTitle')}
        </div>

        <form onSubmit={onSearch}>
          <div className="search-bar">
            <input
              className="field-input"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              placeholder={t('owner.placeholder')}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : t('common.queryLedger')}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error fade-in" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}

        {results !== null && results.length === 0 && (
          <div className="alert alert-info fade-in" style={{ marginTop: 16 }}>
            {t('owner.noneFound')}
          </div>
        )}

        {results !== null && results.length > 0 && (
          <div className="alert alert-success fade-in" style={{ marginTop: 16 }}>
            {t('owner.foundCount', { count: results.length, ownerId })}
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <div className="records-list fade-in">
          {results.map((asset) => (
            <LandRecord key={asset.ulpin} data={asset} compact />
          ))}
        </div>
      )}
    </>
  );
}
