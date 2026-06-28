# SkillStack — Learning Platform

Placement-ready learning hub for aptitude, programming, SQL roadmaps, resume prep, and company interview preparation.

## Run locally

```powershell
python -m http.server 8080
```

Open **http://localhost:8080**

## Deploy to Netlify

### Drag and drop
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the `skillstack` folder into the deploy area

### Git connect (recommended)
1. Push to GitHub
2. Netlify → **Add new site → Import from Git**
3. **Build command:** leave empty
4. **Publish directory:** `.`

After deploy, add your Netlify domain in Firebase Console → Authentication → Authorized domains.

## Production pages

| Page | URL |
|------|-----|
| Home | `/index.html` |
| Login | `/login.html` |
| Profile | `/profile.html` |
| Admin | `/admin.html` |
| SQL Roadmap | `/sql-roadmap.html` |
| SQL Journey | `/sql-journey/` |

## CSS architecture

- `css/skillstack.css` — shared design system (nav, buttons, forms)
- `css/home.css` — homepage
- `css/auth.css` — login
- `css/account.css` — profile
- `css/admin.css` — admin dashboard

## Important

- Include the `images/` folder in deploy (course thumbnails)
- Legacy draft pages are not part of the production user flow
