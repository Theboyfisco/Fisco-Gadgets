# 🚀 Fisco Gadgets — Vercel Deployment Guide

Follow these steps to take your store live on the web.

## 1. Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new).
2. Run these commands in your project terminal:
   ```bash
   git add .
   git commit -m "chore: prepare for vercel deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New** > **Project**.
3. Import your `tech-hub` repository.
4. **Environment Variables**: Open the "Environment Variables" section and add these exactly as they appear in your `.env` file:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `PAYSTACK_SECRET_KEY`
   - `PAYSTACK_PUBLIC_KEY`
   - `NEXT_PUBLIC_APP_URL` (Use your temporary Vercel URL first, then update it later)
5. Click **Deploy**.

## 3. Final Verification

1. Once deployed, visit your Vercel URL.
2. Test the **Comparison** feature and **Cart**.
3. Verify that products are loading correctly from your Supabase database.

---

_Note: I have already configured `package.json` to handle Prisma generation automatically during the Vercel build process._
