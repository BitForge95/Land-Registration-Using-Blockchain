import { useTranslation } from 'react-i18next';

const CHAIN_ICON = '⬡';

const StatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span className={`badge ${isActive ? 'badge-active' : 'badge-retired'}`}>
      <span style={{ fontSize: 8 }}>●</span>
      {status}
    </span>
  );
};

/**
 * LandRecord — displays a single LandAsset returned from the blockchain.
 * @param {{ data: object, compact?: boolean }} props
 */
export default function LandRecord({ data, compact = false }) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <div className="land-record">
      <div className="record-header">
        <span className="record-ulpin">{data.ulpin}</span>
        <StatusBadge status={data.status} />
      </div>

      <div className="record-body">
        <div className="record-field">
          <span className="record-label">{t('record.currentOwner')}</span>
          <span className="record-value">{data.currentOwnerId}</span>
        </div>

        <div className="record-field">
          <span className="record-label">{t('record.gps')}</span>
          <span className="record-value mono">{data.gpsCoordinates}</span>
        </div>

        <div className="record-field">
          <span className="record-label">{t('record.parentUlpin')}</span>
          <span className="record-value mono">{data.parentUlpin ?? t('record.noneRoot')}</span>
        </div>

        {!compact && (
          <div className="record-field full">
            <span className="record-label">{t('record.docHash')}</span>
            <span className="record-value mono">{data.documentHash}</span>
          </div>
        )}
      </div>

      <div className="record-footer">
        <span>{CHAIN_ICON}</span>
        <span>{t('record.footer')}</span>
      </div>
    </div>
  );
}
