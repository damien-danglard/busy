---
applyTo: "**/package.json,**/package-lock.json"
---

# NPM Package Management Instructions

## Dependency Management

When working with Node.js dependencies in this repository:

- **Always use npm commands** instead of manually editing `package.json` or `package-lock.json`
- Use `npm install <package>` to add new dependencies
- Use `npm install -D <package>` to add development dependencies
- Use `npm uninstall <package>` to remove dependencies
- Use `npm update <package>` to update specific packages
- Never manually edit the `dependencies`, `devDependencies`, or `peerDependencies` sections

## Rationale

Manual edits to package files can:
- Create inconsistencies between `package.json` and `package-lock.json`
- Lead to dependency resolution issues
- Break reproducible builds
- Cause version conflicts

## Exceptions

You may manually edit `package.json` for:
- Script definitions in the `scripts` section
- Repository metadata (name, version, description, author, license)
- Configuration fields (engines, type, etc.)

Always run `npm install` after manual changes to update `package-lock.json`.
