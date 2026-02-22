# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

This repo has **frontend** and **backend** in separate folders.

**Frontend (Vite + React)**

```sh
cd frontend
npm i
cp .env.example .env   # optional: set VITE_API_URL for backend
npm run dev
```

**Backend**

```sh
cd backend
npm i
cp .env.example .env   # configure MONGODB_URI, JWT_SECRET, etc.
npm start
```

**Seed mock data (products, promos, admin user)**

With the backend `.env` configured and MongoDB running:

```sh
cd backend
npm run seed
```

This inserts mock products, promo codes (e.g. `WELCOME10`, `MAGNET20`), and an admin user. The API will then serve this data (e.g. `GET /api/products`). Admin login: `admin@magneticbliss.in` / `admin123`.

**Quick start from repo root**

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Frontend
cd frontend && npm i && npm run dev

# In another terminal: Backend
cd backend && npm i && npm start
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
