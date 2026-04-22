#!/usr/bin/env bash
# Push to GitHub, then deploy to Vercel.
# Usage:
#   ./deploy.sh <your-github-username> <repo-name>
# Example:
#   ./deploy.sh aftab-dev fairground-landing

set -e

USERNAME="${1:-}"
REPO="${2:-fairground-landing}"

if [ -z "$USERNAME" ]; then
  echo "Usage: ./deploy.sh <your-github-username> [repo-name]"
  echo "Example: ./deploy.sh aftab-dev fairground-landing"
  exit 1
fi

echo "==> Step 1: Initializing git (if needed)"
if [ ! -d .git ]; then
  git init
  git branch -M main
fi

echo "==> Step 2: Committing all files"
git add .
git commit -m "feat: initial fairground landing page" || echo "    (nothing new to commit)"

echo "==> Step 3: Setting remote to github.com/$USERNAME/$REPO"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$USERNAME/$REPO.git"

echo ""
echo "==> Next: create the repo at https://github.com/new"
echo "    Name: $REPO"
echo "    Visibility: your choice"
echo "    Do NOT add a README, .gitignore, or license (already present)"
echo ""
read -p "Press Enter once you have created the empty GitHub repo... " _

echo "==> Step 4: Pushing to GitHub"
git push -u origin main

echo ""
echo "==> Step 5: Deploying to Vercel"
if ! command -v vercel >/dev/null 2>&1; then
  echo "    Installing Vercel CLI globally..."
  npm install -g vercel
fi

echo "    If this is your first time, vercel will prompt you to log in."
vercel --prod

echo ""
echo "Done. Your site is live."
