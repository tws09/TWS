# Fix Vercel Build Not Running (730ms / "no files prepared")

## What’s going wrong

Your build log shows:

- **Build Completed in 730ms** – A real React build takes minutes, so **no build is running**.
- **"Skipping cache upload because no files were prepared"** – No build output is produced.
- **Deployed artefacts** – Vercel is serving the **entire repo** as static files (markdown, `.agent`, `TWS/` source, etc.) instead of the built app. There is no `index.html` at `/`, so you get 404.

So: **Vercel is not running the install/build from `vercel.json`** (or the repo/branch it deploys doesn’t have that config). The deployment is “static copy of repo” instead of “run build and serve output”.

---

## Fix 1: Force the build from Vercel Dashboard (do this first)

So that the build runs even if `vercel.json` is ignored or missing:

1. Open your project: **https://vercel.com** → your **tws.erp** (or TWS) project.
2. Go to **Settings** → **Build and Deployment** (or **Build and Development**).
3. Set these **explicit overrides** (use “Override” toggles if they exist):

   | Setting            | Value |
   |--------------------|--------|
   | **Framework Preset** | **Other** (so Vercel doesn’t auto-detect and skip your commands). |
   | **Install Command**  | `cd TWS && npm install` |
   | **Build Command**    | `cd TWS && CI=false NODE_OPTIONS=--max-old-space-size=4096 GENERATE_SOURCEMAP=false npm run build:frontend` |
   | **Output Directory**| `TWS/frontend/build` |

4. Leave **Root Directory** empty (so the project root is the repo root and `cd TWS` works).
5. Save, then trigger a **Redeploy** (Deployments → … → Redeploy).

After this, the build should run (you’ll see install + build in the log and it will take more than a minute). The site should then serve `TWS/frontend/build` and `/` will show the app.

---

## Fix 2: Make sure the deployed repo/branch has `vercel.json`

Your build log says:

- **Repository:** `github.com/tws09/tws.erp`
- **Branch:** `main`
- **Commit:** `8fd48ad`

If that repo or branch doesn’t have the **root `vercel.json`** (the one with `installCommand`, `buildCommand`, `outputDirectory`), Vercel won’t run our build.

- If **tws.erp** is the same repo as **TWS** (e.g. same GitHub repo, different name): push your latest code (including the root `vercel.json`) to **main** so commit `8fd48ad` is replaced by a commit that has the config.
- If **tws.erp** is a different repo: copy the root **`vercel.json`** from this project into the root of tws.erp and push to **main**.

Root `vercel.json` should look like:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "cd TWS && npm install",
  "buildCommand": "cd TWS && npm run build:frontend",
  "outputDirectory": "TWS/frontend/build",
  "framework": null,
  "rewrites": [
    { "source": "/favicon.ico", "destination": "/favicon.svg" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

After pushing, redeploy (or let Vercel deploy the new commit).

---

## Fix 3: Exclude repo junk from being deployed (optional)

Right now, when no build runs, Vercel deploys the whole repo (including `.agent`, docs, scripts). After **Fix 1** (and optionally Fix 2), the **only** thing that should be deployed is the contents of **`TWS/frontend/build`**. You don’t need to exclude files for that; the build output is the only thing served once the build runs.

If you ever see the repo root again in artefacts, the first thing to check is that the build is actually running (Fix 1 and 2).

---

## Summary

| Step | Action |
|------|--------|
| 1 | In Vercel: **Settings → Build and Deployment**. Set Framework Preset **Other**, Install Command **`cd TWS && npm install`**, Build Command **`cd TWS && npm run build:frontend`**, Output Directory **`TWS/frontend/build`**. Save. |
| 2 | Redeploy. Check the new build log: you should see `npm install` and `npm run build:frontend` and a build time of several minutes. |
| 3 | Ensure the repo Vercel deploys (tws.erp, branch main) has the root **vercel.json** above, so future deploys keep using the same build even without dashboard overrides. |

Once the build runs and output is `TWS/frontend/build`, the 404 on `/` and “no files prepared” will stop.

---

## If the build fails: `Lifecycle script "build" failed` / `craco build` exit 1

### 1. Use the updated Build Command (CI + memory + source maps)

In **Settings → Build and Deployment**, set **Build Command** to:

```bash
cd TWS && CI=false NODE_OPTIONS=--max-old-space-size=4096 GENERATE_SOURCEMAP=false npm run build:frontend
```

- **`CI=false`** – Optional. The frontend now has ESLint rule overrides in `package.json` so the build passes even when `CI=true`. If you prefer to fail on lint in CI, set `CI=false` here and fix or re-enable the rules over time.
- **`NODE_OPTIONS=--max-old-space-size=4096`** – Gives the Node process more memory (4 GB). React/craco builds often run out of memory on Vercel’s default.
- **`GENERATE_SOURCEMAP=false`** – Skips source map generation so the build uses less memory and is faster.

Save and **Redeploy**.

### 2. Optional: set env in Vercel

In **Settings → Environment Variables**, add (for **Build** only, not Runtime):

| Name | Value |
|------|--------|
| `CI` | `false` |
| `NODE_OPTIONS` | `--max-old-space-size=4096` |
| `GENERATE_SOURCEMAP` | `false` |

Then you can use the shorter Build Command: `cd TWS && npm run build:frontend`.

### 3. Get the real error (run build locally)

To see the actual webpack/craco error (e.g. module not found, syntax error):

```bash
cd TWS/frontend
npm install
npm run build
```

Fix any errors shown there, then push and redeploy on Vercel.
