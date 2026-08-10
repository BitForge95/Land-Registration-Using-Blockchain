import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { PASSWORD_MIN_LENGTH } from '../services/authService';
import LanguageSwitcher from './LanguageSwitcher';

const EMPTY_FORM = { username: '', password: '', confirmPassword: '' };

/**
 * The sign-in / create-account screen shown before the registry is available.
 *
 * Both modes live in one component because they differ only by one field and
 * which action they call.
 */
export default function AuthPage() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signup';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && form.password !== form.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(form.username, form.password);
      } else {
        await signIn(form.username, form.password);
      }
      // On success the provider flips isAuthenticated and App swaps this screen out.
    } catch (err) {
      // authService throws i18n keys; t() returns the key unchanged if it is ever
      // handed something else, so an unexpected message still surfaces.
      setError(t(err.message));
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="tricolor-bar" />

        <div className="auth-brand">
          <div className="logo-emblem">⊛</div>
          <div>
            <div className="auth-brand-name">{t('app.title')}</div>
            <div className="auth-brand-dept">{t('app.dept')}</div>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={`auth-tab${!isSignUp ? ' active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            {t('auth.signInTab')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={`auth-tab${isSignUp ? ' active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            {t('auth.signUpTab')}
          </button>
        </div>

        <div className="auth-body">
          <h1 className="auth-title">
            {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
          </h1>
          <p className="auth-subtitle">
            {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
          </p>

          <form onSubmit={onSubmit} className="form-grid">
            <div className="form-field">
              <label className="field-label" htmlFor="auth-username">
                {t('auth.usernameLabel')}
              </label>
              <input
                id="auth-username"
                className="field-input"
                name="username"
                value={form.username}
                onChange={onChange}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                required
              />
              {isSignUp && <span className="field-hint">{t('auth.usernameHint')}</span>}
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="auth-password">
                {t('auth.passwordLabel')}
              </label>
              <input
                id="auth-password"
                className="field-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
              {isSignUp && (
                <span className="field-hint">
                  {t('auth.passwordHint', { count: PASSWORD_MIN_LENGTH })}
                </span>
              )}
            </div>

            {isSignUp && (
              <div className="form-field">
                <label className="field-label" htmlFor="auth-confirm">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <input
                  id="auth-confirm"
                  className="field-input"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? (
                <><span className="spinner" /> {isSignUp ? t('auth.signingUp') : t('auth.signingIn')}</>
              ) : (
                isSignUp ? t('auth.signUpBtn') : t('auth.signInBtn')
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-error fade-in" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {isSignUp ? (
            <p className="auth-note">{t('auth.citizenOnlyNote')}</p>
          ) : (
            <p className="auth-note">
              {t('auth.demoCredentials')}
              <br />
              <code>admin / admin123</code> · <code>citizen / citizen123</code>
            </p>
          )}
        </div>

        <div className="auth-footer">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
