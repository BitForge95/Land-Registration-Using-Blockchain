import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLandByUlpin } from '../services/api';
import LandRecord from './LandRecord';

export default function SearchLand() {
  const { t } = useTranslation();
  const [ulpin, setUlpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await getLandByUlpin(ulpin.trim());
      setResult(data);
    } catch (err) {
      setError(
        err.message?.includes('404') || err.message?.toLowerCase().includes('not found')
          ? t('search.notFound', { ulpin })
          : t('search.queryFailed', { message: err.message })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('search.title')}</h1>
        <p className="page-subtitle">{t('search.subtitle')}</p>
      </div>

      <div className="card">
        <div className="card-title">
          <span>◎</span> {t('search.cardTitle')}
        </div>

        <form onSubmit={onSearch}>
          <div className="search-bar">
            <input
              className="field-input mono"
              value={ulpin}
              onChange={(e) => setUlpin(e.target.value)}
              placeholder={t('search.placeholder')}
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
      </div>

      {result && <LandRecord data={result} />}
    </>
  );
}
