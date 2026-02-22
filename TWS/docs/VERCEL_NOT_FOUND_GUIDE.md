# Resolving Vercel NOT_FOUND (404) and Building Lasting Understanding

## 1. Suggested fix for your project

### What to do in your codebase

**A. Ensure the correct `vercel.json` is used for your Root Directory**

- **If Vercel project “Root Directory” is empty (build from repo root):**  
  The repo root must have a `vercel.json` that points into `TWS` and to the real build output. You already have this at the repo root:

  - `installCommand`: `cd TWS && npm install`
  - `buildCommand`: `cd TWS && npm run build:frontend`
  - `outputDirectory`: `TWS/frontend/build`

  So no code change is needed here as long as this file is committed and Vercel is building from the repo root.

- **If Vercel “Root Directory” is set to `TWS`:**  
  Then Vercel’s working directory for the build is already `TWS/`. The file that matters is `TWS/vercel.json`:

  - `outputDirectory` must be `frontend/build` (relative to `TWS/`).
  - Your current `TWS/vercel.json` already has this.

  So again, config is correct; the important part is that the build actually runs and produces `frontend/build` inside `TWS`.

**B. Ensure the build output really exists**

NOT_FOUND often means “the deployment has no files to serve” (empty or wrong output directory). Do this:

1. **In Vercel Dashboard**
   - **Settings → Build and Deployment** (or **Build and Development** in the left sidebar — not under General). Scroll to **Root Directory**.
     - Either leave empty and use the **root** `vercel.json` (with `TWS/` in paths), or set to **`TWS`** and rely on **`TWS/vercel.json`**.
   - In the same **Build and Deployment** section
     - Optionally override and set explicitly:
       - **Build Command:** `npm run build:frontend` (if Root = `TWS`) or `cd TWS && npm run build:frontend` (if Root = repo root).
       - **Output Directory:** `frontend/build` (if Root = `TWS`) or `TWS/frontend/build` (if Root = repo root).
     - Do not set “Output Directory” to something that doesn’t exist after the build (e.g. `build` at repo root when the app builds inside `TWS`).

2. **Check the latest deployment**
   - **Deployments → select latest → “Building” / “Logs”**
   - Confirm the build step runs (e.g. `npm run build:frontend` or `cd TWS && npm run build:frontend`) and **succeeds**.
   - If the build fails or is skipped, the output directory will be empty → NOT_FOUND for `/` and other paths.

3. **Ensure `frontend/public` is in the repo**
   - Your React app needs `TWS/frontend/public/index.html` (and ideally `favicon.svg`) committed so that `npm run build` can produce a valid `index.html` in `frontend/build`. If `public` was previously gitignored, un-ignore it and commit those files (you’ve already done this in earlier steps).

**C. If “Root Directory” doesn’t work or you can’t use it**

- Leave **Root Directory empty** (clear the field and save). The **root** `vercel.json` (at repo root) is written to work without it: it runs `cd TWS && npm install` and `cd TWS && npm run build:frontend` and uses `outputDirectory`: `TWS/frontend/build`. So you do **not** need to set Root Directory to `TWS`.
- Make sure the project is connected to the repo that actually has a **`TWS`** folder at the top level (e.g. `tws09/TWS`). If your Vercel project is connected to a different repo (e.g. `tws.erp`) where the app lives at the **root** (no `TWS` folder), the root `vercel.json` will fail because there is no `TWS` directory. In that case you need either to connect Vercel to the repo that has the `TWS` folder, or add a different `vercel.json` in that other repo for its structure.

**D. Summary checklist**

| Check | Action |
|-------|--------|
| Root Directory | Prefer **empty** so the root `vercel.json` is used; only set to `TWS` if you want to use `TWS/vercel.json` instead. |
| Build command | Must run from the directory that contains `package.json` (either repo root with `cd TWS` or Root = `TWS`). |
| Output directory | Must match where the build writes: `TWS/frontend/build` (from repo root) or `frontend/build` (from `TWS`). |
| Build logs | Build must succeed; no “no files prepared” or failed step. |
| `public` in git | `TWS/frontend/public/index.html` (and favicon) must be committed. |

After fixing the above, redeploy. NOT_FOUND for the deployment URL should stop once the build output exists and `outputDirectory` points at it.

---

## 2. Root cause: what was going wrong and why NOT_FOUND appeared

### What the “code” (config + build) was doing vs what it needed to do

- **Intended:**  
  Vercel runs `installCommand`, then `buildCommand`, then serves the contents of `outputDirectory` (e.g. `index.html` and assets). Requests to `/` should be rewritten to `/index.html` and served from that output.

- **What was actually happening in your case:**  
  One or more of these was true:
  - The **build was not running** (wrong repo/branch, or build step failing/skipped), so the output directory was **empty or missing**.
  - The **output directory path** in `vercel.json` or in the dashboard did **not** match where the app actually writes (e.g. building inside `TWS` but output set to a path at repo root).
  - **Root Directory** and which `vercel.json` is used were inconsistent (e.g. Root = `TWS` but config assumed repo root, or the other way around).
  - **`frontend/public`** was gitignored, so the clone had no `index.html` (or favicon) and the build could not produce a proper output.

So from Vercel’s point of view: “I looked for the resource (the static files for this deployment) and they were not found.” That’s NOT_FOUND.

### Conditions that trigger this specific error

- Vercel successfully “deploys” (build step finishes), but the **output directory is empty or wrong**.
- User (or browser) requests the deployment URL (e.g. `https://your-app.vercel.app/`).
- Vercel tries to serve `/` (and rewrites to `/index.html`) from the deployment’s output.
- No file exists at that path in the output → **404 NOT_FOUND**.

So the error is “resource not found” at the **deployment/content** level, not necessarily “deployment ID not found.”

### Misconception or oversight

- **Misconception:** “If the build step doesn’t error, the site will work.”  
  In reality, the build can “succeed” (exit 0) but write to a different folder than `outputDirectory`, or the output directory might be empty if the framework didn’t actually run (e.g. wrong root or missing files).

- **Oversight:** Ignoring that **Root Directory** decides which directory is the project root and thus which `vercel.json` and which paths (e.g. `frontend/build` vs `TWS/frontend/build`) are used.

---

## 3. Underlying concept: why NOT_FOUND exists and the right mental model

### Why this error exists and what it protects

- **NOT_FOUND (404)** is the standard HTTP “resource not found” response. Vercel uses it when:
  - The requested URL path does not match any static file or rewrite destination in the deployment’s output, or
  - The deployment has no output (empty or misconfigured).

- It “protects” you by making it clear that the server received the request but had nothing to serve at that path (instead of failing with a generic 500 or a blank page).

### Correct mental model

1. **Build produces a tree of files** (e.g. `index.html`, `static/...`, `favicon.svg`) in one directory.
2. **Vercel’s job** is to run the build, then serve that directory as the deployment’s “root.”
3. **`outputDirectory`** must point exactly at that directory (relative to the project root Vercel uses).
4. **Rewrites** (e.g. `/(.*)` → `/index.html`) only work if `/index.html` **exists** in that output. If the output is empty or wrong, every request becomes NOT_FOUND.

So: NOT_FOUND on the deployment URL usually means “the deployment’s file tree is empty or the path is wrong,” not “the URL is typed wrong.”

### How this fits into Vercel/framework design

- Vercel separates **build** (run your command, write to disk) from **serve** (serve from `outputDirectory`).
- If the build doesn’t write to the path Vercel expects, the “serve” step has nothing to serve → NOT_FOUND.
- Frameworks (e.g. Create React App) have a **fixed** output folder (e.g. `build/`). Your config must align with that and with where the build runs (repo root vs `TWS`).

---

## 4. Warning signs and similar mistakes

### What to look for so this doesn’t happen again

- **Build logs:** Build finishes in a few hundred ms and says “no files prepared” or similar → output likely empty.
- **Root Directory vs paths:** You have a monorepo or subfolder app (`TWS/`) but Root Directory and `outputDirectory` don’t match (e.g. Root = empty but `outputDirectory: "frontend/build"` with no `TWS` prefix).
- **Gitignore:** Ignoring `public` or similar so that `index.html` (and assets) are not in the repo → build can’t produce a valid output.
- **Branch/repo mismatch:** Vercel builds from `main` but you only pushed fixes to `master` (or the other repo) → old config, no `public`, etc.

### Similar mistakes in related scenarios

- **Serverless / API routes:** NOT_FOUND can also appear if an API route or serverless function is misnamed or in the wrong directory so Vercel doesn’t recognize it.
- **Rewrites to a missing file:** A rewrite like `"destination": "/index.html"` only helps if `index.html` exists in the output; otherwise every path returns NOT_FOUND.
- **Different presets:** If you switch framework preset (e.g. from “Other” to “Create React App”) without aligning Build/Output with your real script and folder structure, output can end up in the wrong place.

### Code smells / patterns that suggest this issue

- `outputDirectory` or Build Command in the dashboard not mentioning the subfolder (e.g. `TWS`) when the app lives in that subfolder.
- A single global `public` in `.gitignore` that can ignore the frontend’s `public` folder.
- Build log showing “Build completed” in &lt; 1 second for a React app (suggests the real build didn’t run).

---

## 5. Alternatives and trade-offs

### Option A: Root Directory = `TWS` (recommended for your repo)

- **Setup:** In Vercel, set Root Directory to **`TWS`**. Use only **`TWS/vercel.json`** with `outputDirectory: "frontend/build"`, `buildCommand: "npm run build:frontend"`, `installCommand: "npm install"`.
- **Pros:** One clear “app root,” paths in config are simple; no `cd TWS` in commands.
- **Cons:** You must remember to set Root Directory when connecting the project.

### Option B: Build from repo root (current approach)

- **Setup:** Root Directory empty. Root `vercel.json` with `cd TWS` in install/build and `outputDirectory: "TWS/frontend/build"`.
- **Pros:** Works even if someone forgets to set Root Directory; single root config.
- **Cons:** Paths and commands are more verbose; two `vercel.json` files (root and `TWS`) to keep in sync if you ever change structure.

### Option C: Explicit overrides in Vercel Dashboard

- **Setup:** Set Build Command, Output Directory (and optionally Install Command) in **Settings → Build & Development** so they override any `vercel.json`.
- **Pros:** Visible in the UI; no need to push config for quick experiments.
- **Cons:** Easy to get out of sync with the repo; teammates might not know why a deployment works or fails.

**Recommendation:** Use **Option A** (Root Directory = `TWS`) and keep **`TWS/vercel.json`** as the single source of truth. You can keep the root `vercel.json` as a fallback for when Root Directory is not set, but make sure both root and `TWS` configs are consistent with the chosen Root Directory so the build always writes to the path specified in `outputDirectory`. After that, NOT_FOUND for your deployment URL should be resolved.
