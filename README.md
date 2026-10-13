# PIMS 2.0 Tenant Site

Static landing page for PIMS 2.0. It has no install step and no build step.

## Run locally

1. Open `index.html` in a browser.

Or serve the folder with any static file server, then open the local URL. For example, with Python:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

Inter and Poppins load from Google Fonts, so the page needs a network connection for those typefaces. Theme choice is stored in the browser (`localStorage` key `pims-theme`).
