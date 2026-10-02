# ChargeHive EV × UrbanCart Mobility

Partnership proposal covering Emergency Roadside Assistance and a hyperlocal Marketplace.

## Local preview

Run `npm start`, then open http://localhost:4195.

Edit proposal copy in `content.js`, styles in `styles.css`, and page behavior in `app.js`.
The four proposal PDFs are stored in `downloads/` and published with the website.

## Publishing

Run `npm run check` and `npm run build` to validate JavaScript and the four PDF downloads.
GitHub Actions publishes the `dist/` folder to GitHub Pages whenever `main` is pushed.

Target domain: https://urbancart.lotusflowai.com

The domain is registered with GoDaddy; its DNS is managed by Cloudflare.
DNS in Cloudflare: `CNAME` named `urbancart`, pointing to `gamer787.github.io`
(DNS only, without proxying).
The custom domain must also be set in this repository's GitHub Pages settings.

This folder is the source checkout. Commit and push edits from this folder to update the live site.
The page's summary currently retains its existing draft label; edit `summary.placeholder`
in `content.js` once the proposal copy is finalized.
