# Frontend UI - Dependency Version Changes

## Lockfile Updates (package-lock.json)

This PR includes the following dependency version upgrades in addition to adding Leaflet for map functionality:

### Production Dependencies
- **axios**: `1.13.6` → `1.14.0` (minor version bump, backward compatible)
- **leaflet**: `^1.9.4` (newly added for map functionality)

### Development Dependencies
- **vite**: `8.0.0` → `8.0.3` (patch version bump, bug fixes)
- Various Babel and build tool dependencies updated to compatible versions

## Rationale

These version upgrades are the result of:
1. **Leaflet addition**: A new dependency required for the land parcel map visualization feature
2. **npm install resolution**: When adding leaflet, npm resolved dependencies to the latest patch/minor versions compatible with the `^` constraints in package.json

## Compatibility Notes

- **axios 1.14.0**: Minor version bump; compatibility with existing API calls is expected per semver, but should be confirmed against the upstream changelog/release notes
- **vite 8.0.3**: Patch release with bug fixes; no breaking changes are expected per semver, subject to upstream release notes
- All upgrades remain within the caret (`^`) version constraints specified in package.json, though runtime compatibility should still be validated against upstream release documentation

## Recommendation

If stricter version pinning is desired for production stability, consider updating package.json to use exact versions (e.g., `"vite": "8.0.3"` instead of `"vite": "^8.0.0"`).
