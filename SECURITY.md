# Security maintenance

## Scope and checks (26 November 2026)

This is the public **bcsm1989.com** site on GitHub Pages. Python's standard library builds static pages; there is no application database, password store, or custom login server here. The Fleet questionnaire sends directly to Google Forms; EVerFlo is a separate service and is outside this change.

- HTTP redirects to HTTPS and GitHub supplies HSTS (verified on the public origin).
- The build adds CSP and a referrer policy to all 14 pages. Only local JavaScript and exact hashes of existing short-link scripts execute. Google Maps and the existing Google Forms submission remain allowed. Inline style support is retained for the existing layout.
- `python scripts/test_security.py` checks the actual built pages. `python scripts/verify.py` checks all links, languages, assets and preservation of the original legal text.
- Publishing requires the security job and build checks to pass. Build/PR jobs have read-only repository permissions; Pages write and OIDC permissions are limited to the deployment job. Actions are pinned to full commit hashes.
- Gitleaks 8.30.1 scans all fetched Git refs and current files. Its download is pinned by SHA-256 and findings are redacted. This is detection, not a guarantee that no secret exists. If a real credential is found, revoke/rotate it with its provider before cleaning history; never paste it in an issue.
- Dependabot checks GitHub Actions versions weekly. There are no pip/npm application dependencies to audit. The Pages platform and runtime updates remain provider-managed. Review update PRs; do not auto-merge untested changes.
- GitHub Dependency Review examines supported dependency changes in PRs and fails on new high/critical known vulnerabilities across runtime, development and unknown scopes. It is not a full audit of provider-managed software or arbitrary vendored code.

## Backups and rollback

The security workflow creates a source Git bundle on main pushes and weekly, verifies it, restores it into a fresh mirror, and compares HEAD. Artifacts expire after 30 days. Download copies to a separate private backup location periodically; this does not back up Google Forms responses or GitHub account/settings/secrets.

To roll back, revert the security change through a PR, run the tests, and publish through the existing Pages workflow. Keep HTTPS enabled. The pre-change source is also preserved in the local `security-backups` folder created for this review. A source bundle can be restored with `git clone website-source.bundle restored-site`.

## Monitoring

The daily public monitor runs around 09:45 Asia/Bangkok (GitHub schedules may be delayed). It checks HTTP-to-HTTPS redirection and HTTPS, HSTS and CSP on the home, Fleet and location pages. It never submits a lead. Failures appear in Actions; the owner must enable GitHub Actions failure notifications. An external uptime service is still needed for independent, rapid outage alerts.

## Controls requiring account or hosting access

These are **not claimed as enabled** by source-code changes:

1. Enable passkeys or authenticator MFA on both GitHub owner accounts, the domain registrar/DNS account, and the Google account owning Forms. Store recovery codes privately and verify recovery before enforcing organization-wide MFA.
2. Review GitHub secret scanning/push protection and branch rules for main. Require the build and security checks after confirming CMS/maintainer access; use least-privilege collaborators and tokens.
3. GitHub Pages does not offer custom response headers or application WAF rules per repository. CSP in HTML cannot provide `frame-ancestors`, X-Frame-Options, nosniff or Permissions-Policy response headers. For those, put the custom domain behind an authorized edge provider or migrate hosting only after staging tests, DNS review and rollback preparation. Start WAF in observation mode, then tune rules against Maps and Fleet/Google Forms traffic; never protect only a client-side button and call it server rate limiting.
4. Google Forms must enforce field validation and its own abuse controls. The browser's existing validation is usability only. Back up form definitions and responses to a restricted encrypted destination, define retention and test restore. No customer response export was performed during this review.

Do not add passwords or client-side access checks to public informational pages and describe them as authentication. Never publish personal data or credentials in this public repository.
