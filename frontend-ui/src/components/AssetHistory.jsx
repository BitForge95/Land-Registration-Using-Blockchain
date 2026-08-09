import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/land';

export default function AssetHistory() {
  const { t } = useTranslation();
  const [ulpin, setUlpin] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/${ulpin}/history`);
      const sortedHistory = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(sortedHistory);
    } catch (err) {
      setError(err.response?.data || t('history.failDefault'));
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{t('history.title')}</h2>
        <p className="card-subtitle">{t('history.subtitle')}</p>
      </div>

      <div className="card-body">
        <form className="form-grid" onSubmit={fetchHistory}>
          <div className="form-group">
            <label>{t('history.ulpinLabel')}</label>
            <input
              required
              placeholder="e.g. MP-JBP-2026-003"
              value={ulpin}
              onChange={(e) => setUlpin(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" disabled={loading} style={{ gridColumn: '1 / -1' }}>
            {loading ? t('history.querying') : t('history.submitBtn')}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {history.length > 0 && (
          <div style={{ marginTop: '2rem', borderLeft: '3px solid #0056b3', paddingLeft: '20px' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>{t('history.ledgerRecords')}</h3>
            {history.map((record, index) => (
              <div key={index} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-29px', top: '5px', width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#0056b3', border: '3px solid white' }} />

                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>
                  {new Date(record.timestamp).toLocaleString()}
                </span>

                <div style={{ backgroundColor: '#f4faff', padding: '10px', borderRadius: '6px', marginTop: '5px', border: '1px solid #cce5ff' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>{t('history.txId')} </strong>
                    <span style={{ fontFamily: 'monospace', color: '#d63384' }}>{record.txId}</span>
                  </div>
                  {record.isDeleted ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>{t('history.deleted')}</span>
                  ) : (
                    <>
                      <div><strong>{t('history.ownerId')}</strong> {record.value.currentOwnerId}</div>
                      <div><strong>{t('history.status')}</strong> {record.value.status}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
