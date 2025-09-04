# Repository Profile

## Overview
- **Project**: Simple web-based authentication and expense dashboard
- **Stack**: HTML, CSS, Vanilla JavaScript (no backend)
- **Purpose**: Demonstrate a login system, local data storage, and basic pages for expenses/reports with diagnostic utilities.

## Key Features
- **Authentication**: Username/password with a simplified hashing approach compatible with all environments
- **Local storage**: Persists users and session in the browser
- **Test/diagnostic pages**: Quick testing, clearing storage, and final system checks

## Default Credentials
- **username**: `admin`
- **password**: `admin123`

## Important Files
- **index.html**: Original main page
- **index-fixed.html**: Updated main page using simplified auth
- **final-test.html**: Advanced diagnostics
- **test-simple.html**: Simple end-to-end login test page
- **test-login.html**: Detailed login tests
- **clear-data.html** / **clear-storage.html**: Clear browser storage
- **start-server.ps1**: Local HTTP server (PowerShell)

### JavaScript
- **js/auth.js**: Original auth manager (uses crypto.subtle)
- **js/auth-simple.js**: Simplified auth manager (recommended)
- **js/auth-fixed.js**: Auth helpers for fixed flow
- **js/storage.js**: Storage manager (localStorage)
- **js/app.js, dashboard.js, expenses.js, reports.js, capital.js**: UI/feature scripts

### Styles
- **css/style.css**: Base styles

## Running Locally
1. Open PowerShell in the repo root
2. Run the local server:
   ```powershell
   powershell -ExecutionPolicy Bypass -File "e:\test\co - 1\start-server.ps1"
   ```
3. Open the browser at:
   - http://localhost:8080/index-fixed.html (recommended)
   - http://localhost:8080/test-simple.html
   - http://localhost:8080/final-test.html

## Known Issues & Notes
- **crypto.subtle**: The original auth (`auth.js`) requires a secure context; use `index-fixed.html` and `js/auth-simple.js` for compatibility in any environment (HTTP/file://)
- **Storage conflicts**: Earlier versions created default users in multiple places; fixed by centralizing logic in auth and cleaning storage
- **Testing**: If you see unexpected behavior, first use `clear-data.html` to reset local storage

## Typical Workflow
1. Clear old data if needed (open `clear-data.html`)
2. Open `index-fixed.html`
3. Login with `admin/admin123`
4. Verify session persists on reload; use logout to end session

## Repository Structure (top-level)
- **/css**: Stylesheets
- **/js**: JavaScript modules
- **/*.html**: Demo, test, and diagnostic pages
- **start-server.ps1**: Simple HTTP server for local testing
- **README.md**, **FIXES.md**, **SOLUTION.md**: Documentation

## Maintenance Tips
- Prefer `auth-simple.js` for local/testing
- For production-like security, replace simple hashing with a stronger method under HTTPS
- Keep storage keys and user creation logic centralized in the auth/storage managers