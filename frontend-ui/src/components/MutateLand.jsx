import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { mutateLand } from '../services/api';

const INITIAL_FORM = {
  parentUlpin: '',
  currentOwnerId: '',
  child1Ulpin: '',
  child1Gps: '',
  child2Ulpin: '',
  child2Gps: '',
  newDocumentHash: '',
};

export default function MutateLand() {
  const { t } = useTranslation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await mutateLand(form.parentUlpin, {
        currentOwnerId: form.currentOwnerId,
        child1Ulpin: form.child1Ulpin,
        child1Gps: form.child1Gps,
        child2Ulpin: form.child2Ulpin,
        child2Gps: form.child2Gps,
        newDocumentHash: form.newDocumentHash,
      });
      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message || t('mutate.failDefault'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('mutate.title')}</h1>
        <p className="page-subtitle">{t('mutate.subtitle')}</p>
      </div>

      <div className="known-issue">
        <Trans
          i18nKey="mutate.knownIssue"
          components={[<strong key="0" />, <code key="1" />, <code key="2" />, <code key="3" />]}
        />
      </div>

      <div className="card">
        <div className="card-title">
          <span>⊗</span> {t('mutate.cardTitle')}
        </div>

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="field-label">{t('mutate.parentUlpinLabel')}</label>
              <input
                className="field-input mono"
                name="parentUlpin"
                value={form.parentUlpin}
                onChange={onChange}
                placeholder="MP-JBP-2026-003"
                required
              />
              <span className="field-hint">{t('mutate.parentUlpinHint')}</span>
            </div>

            <div className="form-field">
              <label className="field-label">{t('mutate.currentOwnerLabel')}</label>
              <input
                className="field-input"
                name="currentOwnerId"
                value={form.currentOwnerId}
                onChange={onChange}
                placeholder="AADHAR-1122-3344"
                required
              />
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: -4,
              }}
            >
              {t('mutate.childALabel')}
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-field">
                <label className="field-label">{t('mutate.child1UlpinLabel')}</label>
                <input
                  className="field-input mono"
                  name="child1Ulpin"
                  value={form.child1Ulpin}
                  onChange={onChange}
                  placeholder="MP-JBP-2026-003-A"
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t('mutate.child1GpsLabel')}</label>
                <input
                  className="field-input mono"
                  name="child1Gps"
                  value={form.child1Gps}
                  onChange={onChange}
                  placeholder="23.1765,79.9559 to 23.1770,79.9560"
                  required
                />
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: -4,
              }}
            >
              {t('mutate.childBLabel')}
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-field">
                <label className="field-label">{t('mutate.child2UlpinLabel')}</label>
                <input
                  className="field-input mono"
                  name="child2Ulpin"
                  value={form.child2Ulpin}
                  onChange={onChange}
                  placeholder="MP-JBP-2026-003-B"
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">{t('mutate.child2GpsLabel')}</label>
                <input
                  className="field-input mono"
                  name="child2Gps"
                  value={form.child2Gps}
                  onChange={onChange}
                  placeholder="23.1770,79.9560 to 23.1775,79.9565"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">{t('mutate.newDocHashLabel')}</label>
            <input
              className="field-input mono"
              name="newDocumentHash"
              value={form.newDocumentHash}
              onChange={onChange}
              placeholder="QmMutationDeedHash..."
              required
            />
            <span className="field-hint">{t('mutate.newDocHashHint')}</span>
          </div>

          <button
            className="btn btn-danger"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <><span className="spinner" /> {t('mutate.executing')}</>
            ) : (
              t('mutate.submitBtn')
            )}
          </button>
        </form>

        {result && (
          <div className="alert alert-success fade-in" style={{ marginTop: 16 }}>
            {result}
          </div>
        )}

        {error && (
          <div className="alert alert-error fade-in" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>
    </>
  );
}
