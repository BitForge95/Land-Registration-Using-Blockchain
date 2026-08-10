/**
 * Client-side accounts and roles.
 *
 * ---------------------------------------------------------------------------
 * SCOPE: this is a UI-level role gate, not access control.
 *
 * Everything here runs in the browser, so it decides what the interface offers
 * a signed-in person -- nothing more. The Spring Boot API performs no
 * authentication of its own, which means a direct request (curl, Postman, or
 * another site) still reaches every endpoint without signing in. Treat the
 * roles below as a demonstration of the intended workflow; enforcing them for
 * real requires the same checks on the server.
 * ---------------------------------------------------------------------------
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

/** Registered citizen accounts. */
const USERS_STORAGE_KEY = 'bhumi-users';

/** The signed-in session. Mirrors the existing `bhumi-lang` naming. */
export const SESSION_STORAGE_KEY = 'bhumi-auth';

/**
 * Built-in accounts. Officials are seeded here and cannot be created through
 * the sign-up form, which mirrors how a real registry issues staff credentials
 * rather than letting them self-serve.
 *
 * These credentials are visible in the built bundle -- unavoidable for anything
 * client-side, and the reason this file is a demo aid rather than a security
 * control. They are documented in the README.
 */
const SEED_USERS = [
  { username: 'admin', password: 'admin123', role: ROLES.ADMIN },
  { username: 'citizen', password: 'citizen123', role: ROLES.USER },
];

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;
export const PASSWORD_MIN_LENGTH = 8;

const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/** Namespaces the digest so a hash lifted from here isn't a hash of the bare password. */
const HASH_NAMESPACE = 'bhumi-registry-v1';

const normalise = (username) => (username || '').trim().toLowerCase();

/**
 * Hashes a password so plaintext never lands in localStorage.
 *
 * Falls back to a non-cryptographic digest when `crypto.subtle` is unavailable,
 * which happens when the app is served over plain HTTP from something other
 * than localhost. The fallback keeps the demo working; it is not a security
 * boundary, but then neither is the primary path in a client-only design.
 */
export const hashPassword = async (username, password) => {
  const material = `${HASH_NAMESPACE}:${normalise(username)}:${password}`;

  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(material);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 5381;
  for (let i = 0; i < material.length; i += 1) {
    hash = ((hash << 5) + hash + material.charCodeAt(i)) | 0;
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // A corrupted store shouldn't lock everyone out -- start over.
    return [];
  }
};

const writeUsers = (users) =>
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

const findSeedUser = (username) =>
  SEED_USERS.find((user) => normalise(user.username) === normalise(username));

const findRegisteredUser = (username) =>
  readUsers().find((user) => normalise(user.username) === normalise(username));

export const isUsernameTaken = (username) =>
  Boolean(findSeedUser(username) || findRegisteredUser(username));

/**
 * Validates a requested account.
 *
 * @returns {string|null} an i18n key describing the problem, or null if valid
 */
export const validateCredentials = (username, password) => {
  const trimmed = (username || '').trim();

  if (!trimmed || !password) return 'auth.errors.required';
  if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
    return 'auth.errors.usernameLength';
  }
  if (!USERNAME_PATTERN.test(trimmed)) return 'auth.errors.usernameInvalid';
  if (password.length < PASSWORD_MIN_LENGTH) return 'auth.errors.passwordTooShort';

  return null;
};

/**
 * Verifies credentials against the seeded officials and registered citizens.
 *
 * @returns {Promise<{username: string, role: string}>}
 * @throws {Error} with an i18n key as its message when the credentials don't match
 */
export const authenticate = async (username, password) => {
  const seed = findSeedUser(username);
  if (seed) {
    if (seed.password !== password) throw new Error('auth.errors.invalidCredentials');
    return { username: seed.username, role: seed.role };
  }

  const registered = findRegisteredUser(username);
  if (!registered) throw new Error('auth.errors.invalidCredentials');

  const attempted = await hashPassword(registered.username, password);
  if (attempted !== registered.passwordHash) throw new Error('auth.errors.invalidCredentials');

  return { username: registered.username, role: registered.role };
};

/**
 * Creates a citizen account.
 *
 * The role is hard-coded rather than taken as an argument, so no caller can
 * create an official through the sign-up form.
 *
 * @returns {Promise<{username: string, role: string}>}
 * @throws {Error} with an i18n key as its message when the request is rejected
 */
export const registerCitizen = async (username, password) => {
  const trimmed = (username || '').trim();

  const validationError = validateCredentials(trimmed, password);
  if (validationError) throw new Error(validationError);

  if (isUsernameTaken(trimmed)) throw new Error('auth.errors.usernameTaken');

  const users = readUsers();
  users.push({
    username: trimmed,
    passwordHash: await hashPassword(trimmed, password),
    role: ROLES.USER,
    createdAt: new Date().toISOString(),
  });
  writeUsers(users);

  return { username: trimmed, role: ROLES.USER };
};

/* ------------------------------------------------------------- session ---- */

export const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    // Guard against a hand-edited entry naming a role that doesn't exist.
    if (!parsed?.username || !Object.values(ROLES).includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeSession = (session) =>
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

export const clearSession = () => localStorage.removeItem(SESSION_STORAGE_KEY);
