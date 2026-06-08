<div align="center">
<img width="1200" height="475" alt="Seth Capital Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Seth Capital Loan Manager

A comprehensive system for tracking loan applications, financial calculations, and monthly collection payments, custom-tailored for **Seth Capital**. Featuring high-performance charts, bilingual support (සිංහල / English), and real-time statistics.

---

## 🚀 Quick Start (Run Locally)

**Prerequisites:** [Node.js](https://nodejs.org/) installed on your machine.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` or `.env.local` file in the root directory and add your keys (if any):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *Your app will run locally at [http://localhost:3000](http://localhost:3000)*

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🛠️ GitHub & Netlify Deployment Guide (for VS Code)

If you are seeing **"The repository is empty"** error or if your code is not uploading, please refer to the step-by-step resolution below.

### Step 1: Why did it fail?
1. **Only README.md was added:** When you ran `git add README.md`, you only staged the readme file. You need to run `git add .` to upload the active code, components, package configurations, and assets!
2. **Remote Origin conflict:** Since `remote origin already exists`, your folder is already connected to some Git repository address (possibly old or incorrect).

---

### Step 2: Push the entire project correctly (VS Code Terminal)

Open your project folder in VS Code, open the terminal (`Ctrl + ` ` `), and run these commands **one by one**:

1. **Fix the remote origin URL:**
   ```powershell
   git remote set-url origin https://github.com/dhammikarathnayakework-crypto/DAAQQA.git
   ```

2. **Add ALL project files (not just README):**
   ```powershell
   git add .
   ```

3. **Commit the complete codebase:**
   ```powershell
   git commit -m "feat: complete Seth Capital dashboard codebase"
   ```

4. **Push the code to GitHub:**
   ```powershell
   git push -u origin main --force
   ```

---

### Step 3: Deploy to Netlify

Once the code is uploaded to GitHub, Netlify will detect it instantly.

1. Go to your **Netlify Dashboard** -> **Add new site** -> **Import an existing project**.
2. Select **GitHub** and authorize access.
3. Choose the repository **DHAMMIKA-AD**.
4. Configure the Build settings:
   - **Build Command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy Site**. Your live system will be ready in under a minute!
