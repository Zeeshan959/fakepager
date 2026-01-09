# Pagerlo

## How to Release the Desktop App

Because this is a desktop application, Vercel cannot build the installer (`.exe`) automatically. You must build it on your computer and upload it.

### Step 1: Build the App
Open your terminal in this project folder and run:

```bash
npm run electron:build
```

This will:
1. Compile the code.
2. Create the installer (e.g., `Pagerlo-Setup.exe`).
3. Automatically copy it to the `public/` folder.

### Step 2: Push to GitHub
Once the build finishes, you need to upload the new installer file to GitHub so Vercel can see it.

```bash
git add .
git commit -m "Update desktop installer"
git push
```

### Step 3: Deploy
Vercel will detect the push and redeploy your website. The `Pagerlo-Setup.exe` file will be available for users to download from your landing page.
