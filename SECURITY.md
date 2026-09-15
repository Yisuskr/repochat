# Security Policy

RepoChat is an early preview extension. Please do not open public issues for vulnerabilities.

## Reporting A Vulnerability

If you find a security issue, contact the repository owner privately and include:

- A short description of the issue.
- Steps to reproduce.
- Potential impact.
- Suggested fix, if known.

## Security Principles

- No secrets are committed to the repository.
- Client-provided repository identifiers are not trusted as proof of access.
- Private repository access must be verified server-side before realtime collaboration is enabled.
- Privileged database credentials must never be used in extension client code.
