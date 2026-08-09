import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { transferOwnership } from '../services/api';
import LandRecord from './LandRecord';

const INITIAL_FORM = {
  ulpin: '',
  sellerId: '',
  newOwnerId: '',
  newDocumentHash: '',
};

export default function TransferLand() {
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
      const data = await transferOwnership(form.ulpin, {
        newOwnerId: form.newOwnerId,
        sellerId: form.sellerId,
        newDocumentHash: form.newDocumentHash,
      });
      setResult(data);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message || t('transfer.failDefault'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{t('transfer.title')}</h1>
        <p className="page-subtitle">{t('transfer.subtitle')}</p>
      </div>

      <div className="known-issue">
        <Trans
          i18nKey="transfer.knownIssue"
          components={[<strong key="0" />, <code key="1" />, <code key="2" />, <code key="3" />]}
        />
      </div>

      <div className="card">
        <div className="card-title">
          <span>⇌</span> {t('transfer.cardTitle')}
        </div>

        <form onSubmit={onSubmit} className="form-grid">
          <div className="form-field">
            <label className="field-label">{t('transfer.ulpinLabel')}</label>
            <input
              className="field-input mono"
              name="ulpin"
              value={form.ulpin}
              onChange={onChange}
              placeholder="MP-JBP-2026-003"
              required
            />
            <span className="field-hint">{t('transfer.ulpinHint')}</span>
          </div>

          <div className="form-field">
            <label className="field-label">{t('transfer.sellerLabel')}</label>
            <input
              className="field-input"
              name="sellerId"
              value={form.sellerId}
              onChange={onChange}
              placeholder="AADHAR-1122-3344"
              required
            />
            <span className="field-hint">{t('transfer.sellerHint')}</span>
          </div>

          <div className="form-field">
            <label className="field-label">{t('transfer.newOwnerLabel')}</label>
            <input
              className="field-input"
              name="newOwnerId"
              value={form.newOwnerId}
              onChange={onChange}
              placeholder="AADHAR-5566-7788"
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">{t('transfer.newDocHashLabel')}</label>
            <input
              className="field-input mono"
              name="newDocumentHash"
              value={form.newDocumentHash}
              onChange={onChange}
              placeholder="QmNewHashAfterTransfer..."
              required
            />
            <span className="field-hint">{t('transfer.newDocHashHint')}</span>
          </div>

          <button
            className="btn btn-danger"
            type="submit"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <><span className="spinner" /> {t('transfer.executing')}</>
            ) : (
              t('transfer.submitBtn')
            )}
          </button>
        </form>

        {result && (
          <div className="alert alert-success fade-in" style={{ marginTop: 16 }}>
            {t('transfer.success')}
          </div>
        )}

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
