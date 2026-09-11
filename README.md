# The Agora Project

A full-featured SAT test preparation platform built with React, Vite, and Supabase. Students take timed practice tests (linked from the official College Board practice-test PDFs), get personalized study plans, review mistakes, track progress, and explore college admissions — all from one dashboard.

Live at: [theagoraproject.app](https://theagoraproject.app)

---

## Quick Start (clone to deploy in 15 minutes)

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node)
- A free **Supabase** account ([supabase.com](https://supabase.com))
- A free **Vercel** account ([vercel.com](https://vercel.com)) — or any static host
- A **GitHub** account

### Step 1: Clone the Repo

```bash
git clone https://github.com/agora1234/agoraproject.git
cd agoraproject
```

### Step 2: Set Up Supabase (Database + Auth)

1. Go to [supabase.com](https://supabase.com) and create a new project. Pick any name and a strong database password. Choose a region close to your users.
2. Wait for the project to finish provisioning (about 1 minute).
3. Go to **Project Settings > API** and copy these two values:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `anon public` key (a long string starting with `eyJ...`)
4. Go to **SQL Editor** in the Supabase dashboard.
5. Open the file `supabase-schema.sql` from this repo, copy the entire contents, paste it into the SQL Editor, and click **Run**. This creates all the tables, columns, and security policies the app needs:
   - `profiles` — user accounts with name, email, role, school affiliation
   - `test_attempts` — every test taken, with answers, scores, timing, and weak topics
   - `studied_topics` — chapter completion and practice question tracking
   - `mistakes` — wrong answers with hints, notes, and spaced repetition data
   - `post_scores` — milestone score snapshots for progress tracking
   - `reviews` — mistake review scheduling
   - Row Level Security (RLS) policies so each user can only see their own data
6. Go to **Authentication > Settings > Email** and set:
   - **Enable email confirmations**: ON or OFF (your choice — if OFF, users can sign in immediately after signup)
   - **Confirm email template**: leave as default

### Step 3: Create a Local Environment File

In the project root, create a file called `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with the ones you copied from Supabase in Step 2.

### Step 4: Install Dependencies and Run Locally

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`. Create an account and you should see the landing page, then login, then the dashboard.

### Step 4b: Run the Test Suite (optional but recommended)

End-to-end tests live in `tests/e2e/` and run on Playwright. The first run needs a
one-time browser download:

```bash
npx playwright install chromium
```

Then run the tests. Playwright starts its own dev server on port 5299, so this
does not collide with `npm run dev`:

```bash
npm test
```

Out of the box this covers everything reachable without an account: the landing
page, the sign-in and sign-up forms, the failed-login path, the catch-all
redirect, that all 20 protected routes bounce a signed-out visitor to `/login`,
and mobile layout checks.

To also exercise the signed-in app (dashboard, guide, mistakes, settings, and the
rest), point the suite at a **throwaway** student account:

```bash
cp .env.test.example .env.test.local
```

Fill in `E2E_EMAIL` and `E2E_PASSWORD` in `.env.test.local`. That file is
gitignored, so the credentials never leave your machine. Use a disposable test
account, never a real student's login. With it set, `npm test` signs in once,
reuses the session, and sweeps every protected route for crashes, console
errors, and dead navigation links.

Useful variants:

```bash
npm run test:public
```

```bash
npm run test:ui
```

### Step 5: Deploy to Vercel

1. Push this repo to your own GitHub account (fork it or create a new repo and push).
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, and import your GitHub repo.
3. In the Vercel project settings, go to **Settings > Environment Variables** and add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
4. Vercel will auto-detect Vite. The default build settings work out of the box:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. It takes about 30 seconds. Your site is now live.

Every time you push to the `main` branch, Vercel automatically rebuilds and deploys.

### Step 6: Create the Master (Admin) Account

The admin panel is the master view: it sees every student in every program, manages tutor access, and manages answer keys.

1. Sign up through the app with the email you want to use as the master account (the schema file uses `agora@admin.edu` as the default).
2. In Supabase SQL Editor, run (with your email):
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'agora@admin.edu';
```
3. Log out and back in. You will now see the admin panel.

This SQL is the only way an account becomes admin. Signup always creates a student, even if someone tampers with the request.

### Step 7: Set Up Programs and Tutor Logins

Programs (e.g. **East Orange Public Library**, **CitySquash**) are the unit tutors are scoped to. The schema seeds those two; add more from **Admin Panel → Programs**.

1. **Students** pick their program from the dropdown at signup (or later in Settings). The admin can also move a student between programs from the **Students** tab.
2. **Tutors** sign up through the normal signup form like anyone else. Then, as admin, open **Admin Panel → Students**, set that account's **Role** to `tutor` and its **Program** to the program they teach.
3. That tutor's login now only sees students whose program matches. This is enforced by Row Level Security in the database, not just hidden in the UI, and tutors cannot change their own program.
4. Repeat for each program: one tutor login per program, one admin login that sees all of them.

### Step 8: (Optional) Custom Domain

In Vercel, go to **Settings > Domains** and add your custom domain. Follow the DNS instructions Vercel gives you.

---

## How Everything Works

### Landing Page (`/`)

The first thing visitors see. Public — no login required. Features:
- 3D floating educational tools (pencils, calculators, rulers, books, protractors, bar graphs) built with Three.js and React Three Fiber
- Animated logo that slides up from the bottom
- Feature overview, how-it-works timeline, animated stat counters
- SAT coverage overview
- Mock dashboard preview in a browser frame
- About Us section
- Sign In / Get Started buttons that link to `/login`

### Onboarding Flow

1. **Sign Up** (`/login`) — create an account, enter your name, and pick your program from the dropdown
2. **Pick Test Date** (`/pick-test-date`) — select your upcoming test date from the official schedule
3. **Prior Score** (`/prior-score`, optional) — enter a previous score. This populates your score tiles but still lets you take the full diagnostic pre-test later
4. **Dashboard** (`/dashboard`) — your home base

### Dashboard (`/dashboard`)

The main hub after login. Shows:
- Score overview tiles: Best Score, Highest Test, Most Recent, Improvement, Percentile, Superscore
- Pre-test CTA (if you haven't taken the diagnostic yet — even if you entered a prior score)
- Resource cards linking to every feature (Study Guide, Practice, Mistakes, Strategies, Extra Tests, Calendar, College Recruiting, Formula Sheet, Journey, Tasks)
- Score trend chart (appears after first completed test)
- Recent test attempts with scores and dates
- Study progress by chapter with completion percentages

### Test Taking (`/test/:attemptId`)

Full-screen timed answer-sheet experience. The test questions themselves are NOT hosted on
this site: each test links out to the official College Board practice-test PDF, which students
open in a second tab. This site provides the timer, answer sheet, and scoring:
- Per-section countdown timers and pacing indicator
- Module-by-module navigation with a link to the College Board PDF (with the current question's page number)
- Break screens between sections
- Answer auto-saving (every answer is saved to Supabase immediately)
- Question flagging for review
- SAT format: 2 Reading & Writing modules + 2 Math modules

**Available tests** (all official College Board practice tests):
- Pre-Test (diagnostic) → SAT Practice Test #11
- Final Test → SAT Practice Test #4
- Skill Builder Tests 1–5 → SAT Practice Tests #5, #6, #7, #8, #10
- Total: 7 full-length practice tests

### Results (`/results/:attemptId`)

After completing a test:
- Total score with percentile ranking
- Section-by-section breakdown
- Weak topic identification (which chapters you missed the most questions on)
- Comparison with previous attempts
- Links to review mistakes and study weak areas

### Study Guide (`/guide`)

Interactive chapter-by-chapter lessons:
- Organized by domain (Reading & Writing, Math)
- Each chapter has: lesson content, strategy tips, and embedded practice questions
- Progress tracking per chapter (percentage complete)
- Search and filter
- Lesson Player with AI tutor avatar and text-to-speech narration

### More Practice (`/practice`)

Extra practice question bank:
- 100+ additional questions
- Filter by chapter/topic
- Answer choices with immediate feedback (green for correct, red for wrong)
- Retry button for incorrect answers
- Score summary (questions answered, correct count)
- Answers persist in localStorage

### Formula Sheet (`/formulas`)

Quick-reference cheat sheet:
- Math Formulas (8 groups), Grammar & Writing Rules (5 groups), Reading Strategies (3 groups)
- Search bar to filter formulas
- Collapsible accordion sections

### Test Strategies (`/strategies`)

Section-by-section strategy guides:
- Reading strategies, Writing & Language tips, Math approaches
- Timing advice, elimination techniques, common traps
- Accordion FAQ format

### Extra Tests (`/extra-tests`)

Additional full-length practice tests beyond the diagnostic:
- Skill Builder Tests 1–5
- Status tracking (available, completed, locked)
- Start/resume buttons
- Completed tests show scores

### Mistakes (`/mistakes`)

Mistake review system:
- Every wrong answer from every test is captured
- Link to the original question in the College Board PDF (with page number) alongside your answer vs. correct answer
- Context-specific hints generated from question content
- Personal notes per mistake
- Spaced repetition scheduling (mistakes resurface at optimal intervals)
- Mark as "learned" when mastered
- Filter by section

### Progress Report (`/report`)

Comprehensive analytics:
- Score trend chart across all attempts
- Section breakdown with progress bars
- Percentile tracking
- Superscore calculation (best section scores across all tests)
- Improvement metrics
- Shareable link (generates compressed URL with your report data)

### Calendar (`/calendar`)

Adaptive study schedule:
- Set your test date and how many days per week you can study
- Calendar auto-fills with daily tasks based on your weak areas
- Task types: study chapters, practice questions, review mistakes
- Visual day-by-day grid
- Navigate between weeks

### Journey (`/journey`)

Visual progress roadmap:
- Milestones: Pre-Test → Study Guide → Practice → Mistakes Review → Final Test
- Completed milestones marked, current milestone highlighted, future milestones locked
- Progress percentage

### Tasks (`/tasks`)

Daily task checklist:
- Generated from your study plan
- Task priorities (high, medium, low)
- Completion tracking
- Links to start each task

### College Recruiting (`/college-recruiting`)

Searchable database of 780+ colleges:
- Estimated admission chances based strictly on your test scores
- Filter by region, size, cost, test policy
- Each school shows: name, location, test score ranges, majors, application info
- College logos fetched via multi-source cascade (Google Favicons, apple-touch-icon, icon.horse, DuckDuckGo)
- Note: the algorithm only uses test scores — actual chances may differ since schools also consider GPA, extracurriculars, and essays

### Settings (`/settings`)

User account management:
- Profile picture upload
- Email display
- Password change
- School affiliation
- Exam preference toggle

### About (`/about`)

Feature overview page:
- What AGORA is and how it works
- Feature descriptions
- 6-step process walkthrough
- For Tutors and For Administrators sections

---

## User Roles

### Student
Full access to all features: tests, study guide, practice, tracking, college recruiting, formula sheet, calendar, journey, tasks.

### Tutor
Dashboard showing the scores, progress, and attempt history of the students in the tutor's program only (enforced by database Row Level Security). Cannot take tests or modify student data. Tutor access is granted by an admin from the Admin Panel; there is no self-service tutor signup.

### Admin (master account)
Full system access across every program:
- View all students and their data, filter by program
- Grant or revoke tutor access and assign each tutor to a program
- Add, rename, and remove programs
- Manage test answer keys and extract answer keys from PDFs
- User statistics and data analysis
- Created by signing up normally, then setting `role = 'admin'` in Supabase SQL (see Step 6)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **React Router v6** | Client-side routing with lazy-loaded pages |
| **Supabase** | PostgreSQL database, authentication, real-time subscriptions, file storage |
| **Framer Motion** | Page transitions, scroll animations, UI interactions |
| **Three.js + React Three Fiber** | 3D animated objects on the landing page |
| **Chart.js + react-chartjs-2** | Score trend charts and progress visualizations |
| **PDF.js** | Client-side PDF rendering for test papers |
| **LZ-String** | Report compression for shareable URLs |
| **Vercel** | Hosting with automatic deployments, analytics, and speed insights |

---

## Project Structure

```
sat-thrive/
├── public/
│   ├── logo.png                    # App logo
│   ├── practice-test-11.pdf        # SAT pre-test PDF
│   ├── pretest-questions.pdf       # Pre-test question reference
│   ├── final-test-questions.pdf    # Final test PDF
│   ├── final-test-answer-key.pdf   # Final test answer key
│   ├── og-image.png                # Social sharing image
│   └── og-image-1200x630.png      # Open Graph image
├── src/
│   ├── pages/                      # 31 page components
│   │   ├── Landing.jsx             # Public landing page with 3D animations
│   │   ├── Login.jsx               # Auth (sign in / sign up)
│   │   ├── Dashboard.jsx           # Main student dashboard
│   │   ├── TestTaking.jsx          # Full-screen timed test
│   │   ├── Results.jsx             # Post-test scores and analysis
│   │   ├── Guide.jsx               # Interactive study guide
│   │   ├── MorePractice.jsx        # Extra practice questions
│   │   ├── FormulaSheet.jsx        # Formula/rule reference sheet
│   │   ├── TestStrategies.jsx      # Section-by-section strategies
│   │   ├── ExtraTests.jsx          # Additional practice tests
│   │   ├── Mistakes.jsx            # Mistake review with spaced repetition
│   │   ├── Report.jsx              # Progress report with charts
│   │   ├── Calendar.jsx            # Adaptive study calendar
│   │   ├── Journey.jsx             # Progress roadmap
│   │   ├── Tasks.jsx               # Daily task checklist
│   │   ├── CollegeRecruiting.jsx   # College search (780+ schools)
│   │   ├── Settings.jsx            # Account settings
│   │   ├── About.jsx               # Feature overview
│   │   ├── Welcome.jsx             # Onboarding slideshow
│   │   ├── ChooseTest.jsx          # Sets SAT preference, forwards to onboarding
│   │   ├── Admin.jsx               # Admin panel
│   │   ├── TutorDashboard.jsx      # Tutor view
│   │   ├── Share.jsx               # Public shareable report
│   │   ├── AuthCallback.jsx        # Email confirmation handler
│   │   ├── ResetPassword.jsx       # Password reset
│   │   ├── SetupPlan.jsx           # Study plan configuration
│   │   ├── PickTestDate.jsx        # Test date selection
│   │   ├── PriorScore.jsx          # Prior score entry
│   │   ├── Overview.jsx            # Redirect to /report
│   │   └── FinalTest.jsx           # Redirect to /dashboard
│   ├── components/                 # shared components
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── AppIcons.jsx            # 40+ SVG icon library
│   │   ├── Toast.jsx               # Toast notification system
│   │   ├── AppErrorBoundary.jsx    # Error boundary
│   │   ├── LessonPlayer.jsx        # AI tutor with text-to-speech
│   │   ├── AnimateOnScroll.jsx     # Scroll-triggered animations
│   │   ├── AnimatedNumber.jsx      # Animated number transitions
│   │   ├── BrandLink.jsx           # Logo link
│   │   ├── TopResourceNav.jsx      # Quick resource links
│   │   ├── UserMenu.jsx            # User dropdown
│   │   └── PasswordInput.jsx       # Password field with toggle
│   ├── data/                       # data files
│   │   ├── tests.js                # Test catalog (7 SAT tests, College Board links)
│   │   ├── testData.js             # SAT answer keys, chapters, scoring
│   │   ├── examData.js             # Unified exam config, scoring, percentiles
│   │   ├── collegeData.js          # 780+ college database
│   │   ├── guideContent.js         # SAT study guide lessons
│   │   ├── practiceQuestionBank.js # Combined practice question bank
│   │   └── ... (more data files)
│   ├── lib/                        # utility modules
│   │   ├── supabase.js             # Supabase client initialization
│   │   ├── studyPlan.js            # Adaptive schedule builder
│   │   ├── mistakesStore.js        # Mistake tracking + spaced repetition
│   │   ├── studyProgress.js        # Chapter completion tracking
│   │   ├── examChoice.js           # Exam preference management
│   │   ├── pretestGate.js          # Resource unlock logic
│   │   ├── reportShare.js          # Shareable report encoding
│   │   ├── dashboardData.js        # Dashboard data loader
│   │   ├── questionHints.js        # Hint generation
│   │   ├── progressMetrics.js      # Streak and level calculation
│   │   ├── validate.js             # Input validation
│   │   └── viewAs.js               # Admin preview mode
│   ├── hooks/
│   │   └── useAuth.jsx             # Auth context (user, profile, sign in/out)
│   ├── App.jsx                     # Routing, lazy loading, transitions
│   └── index.css                   # Global styles and theme
├── supabase-schema.sql             # Complete database schema (run in Supabase)
├── vercel.json                     # Deployment config with CSP headers
├── vite.config.js                  # Vite config with code splitting
├── package.json                    # Dependencies and scripts
└── .env.local                      # Environment variables (NOT committed)
```

---

## Environment Variables

| Variable | Where to Set | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` + Vercel | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Your Supabase anonymous/public API key |

These are the only two environment variables needed. Never commit `.env.local` to git.

---

## Common Tasks

### Add a new practice test

Tests are not hosted on this site — each entry links to an official College Board practice-test PDF.

1. Add the test entry to `src/data/tests.js` with its College Board `cbUrl`/`cbLabel`
2. Add the answer key to `src/data/extraAnswerKeys.js`
3. Add page mappings to `src/data/extraPdfPageMaps.js` (used to point students at the right PDF page per question)

### Change the landing page

Edit `src/pages/Landing.jsx`. The 3D objects are defined as React Three Fiber components in the same file. The data (features, steps, stats) is at the top of the file.

### Modify the study guide content

Edit `src/data/guideContent.js`.

### Update college data

Edit `src/data/collegeData.js`. Each college has: name, rank, location, size, cost, test policy, SAT/ACT score ranges, majors, and domain for logo fetching.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Blank screen after deploy | Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel environment variables |
| "Missing Supabase environment variables" | Create `.env.local` with both variables, then restart `npm run dev` |
| Login works but dashboard is empty | Run `supabase-schema.sql` in the Supabase SQL Editor — the tables haven't been created yet |
| College logos not showing | Check that `vercel.json` CSP `img-src` includes `https://*.edu https://*.google.com https://icon.horse https://icons.duckduckgo.com` |
| Build fails on Vercel | Make sure you're using Node 18+. In Vercel settings, set Node.js version to 18.x or higher |
| "ERESOLVE" dependency error | Run `npm install --legacy-peer-deps` |

---

## License

MIT
