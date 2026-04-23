# Thomas Wimmer Landing Page V2

Premium German-market landing page for 1:1 trading mentoring.

## Files

- `index.html` — full landing page markup
- `styles.css` — responsive editorial styling with mobile-first funnel refinements
- `app.js` — reveal animations, multi-step application form, ticker and Three.js hero layer with canvas fallback
- `assets/` — logo and Thomas Wimmer imagery

## Three.js

The page loads Three.js asynchronously from jsDelivr. If the CDN is unavailable, the hero automatically falls back to a lightweight canvas animation, so the page still works offline or in locked-down environments.

## Form Integration

The application form currently shows an on-page success state. To connect it to a CRM or webhook, replace the simulated timeout in `app.js` inside the `form.addEventListener('submit', ...)` block with a `fetch()` call to your endpoint.

Example payload source:

```js
const payload = Object.fromEntries(new FormData(form).entries());
```

## Legal Note

The page intentionally avoids profit guarantees and includes a risk notice. Before production launch, connect final legal links for Impressum, Datenschutz, AGB and Risikohinweis.
