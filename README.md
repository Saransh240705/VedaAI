# PrepStackAI - AI-Powered Curriculum & Assignment Engineering Platform

PrepStackAI is a high-fidelity, premium SaaS platform designed for educators and teachers to instantly formulate curriculum-aligned question papers and solution schemes. By parsing raw course materials (PDFs, Microsoft Word `.docx` files, and images) and leveraging **Gemini 2.5 Flash**, PrepStackAI generates beautiful, printable A4 question sheets with institution-branded letterheads, custom visual badges, and separated teacher answer keys.

---

## 🌟 Key Features

- **Generative Question Formulation**: calibrates dynamic prompts using **Gemini 2.5 Flash** to structure multi-section question sheets based on customizable Marks, Topic, Class Grade, Question Types, and specific teacher instructions.
- **Dual-Column Authentication & Interactive Onboarding**:
  - Sleek Login / Sign Up portal featuring password visibility micro-interactions and a full-bleed visual grid showcasing branding graphics.
  - A 3-step Onboarding wizard allowing educators to customize their preset avatar, specify their institution name and location, and toggle target teaching subjects and grade filters.
- **Strict Multi-User Session Isolation**: Dynamically scopes assignments and profile parameters utilizing account-specific tokens (`PrepStackai_profile_${userEmail}` and `x-user-email` headers). Multiple teachers can test the same browser sandbox without data leakage or skipped onboarding steps.
- **Multi-Format Document Parsing**: Uses magic-byte binary header matching and the `mammoth` parser to dynamically extract curriculum text from uploaded PDFs, images, and `.docx` structures.
- **Resilient Queued Generation**: Implements a robust background task pipeline utilizing **BullMQ** and **Redis** to execute generation jobs, supported by an exponential backoff wrapper (`generateWithRetry`) to dynamically handle rate limits or transient upstream 503 outages.
- **Premium Printable A4 PDF Exports**:
  - **Independent PDF Compilation**: Separate downloads for **Question Paper PDF** and **Answer Key PDF** in high-definition using `jspdf` and `html2canvas-pro`.
  - **Tailwind CSS v4 Compatibility**: Switches standard capturing to `html2canvas-pro` to successfully parse modern wide-gamut CSS Level 4 color functions (`oklab()`, `oklch()`).
  - **Zero-Student Leak Print Design**: Custom print layouts equipped with `print:hidden` overlays, ensuring standard browser printing (Cmd+P) outputs _only_ the student question paper.

---

## 🏗️ Monorepo Architecture

PrepStackAI is organized as a clean, unified monorepo:

```text
PrepStackAI/
├── backend/                  # Express.js server & BullMQ background worker
│   ├── src/
│   │   ├── config/           # Mongoose DB & Redis connections
│   │   ├── models/           # Assignment & GeneratedPaper mongoose schemas
│   │   ├── routes/           # Express API route controllers (assignments, papers, uploads)
│   │   ├── services/         # aiServices (Gemini logic & retries), parserService (Zod parse)
│   │   ├── socket/           # WebSockets server config (live progression notifications)
│   │   └── workers/          # BullMQ queue generation workers
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js React client application
│   ├── app/
│   │   ├── assignment/       # Assignments list dashboard & dynamic [id] viewer
│   │   ├── components/       # SideBar, NavBar, AppLayoutWrapper (auth route guards)
│   │   ├── create-assignment/# Question criteria creation forms
│   │   ├── login/            # Auth login / signup tabs portal
│   │   ├── onboarding/       # Stepper profile branding wizard
│   │   ├── profile/          # Settings page for avatar uploads & school names
│   │   ├── layout.tsx        # Global Next.js wrapper
│   │   └── globals.css       # Tailwind CSS v4 styling rules
│   ├── public/               # Static assets (Banner.png, Avatar preset, empty states)
│   └── package.json
│
└── docker-compose.yml        # Docker configuration for local services (MongoDB, Redis)
```

---

## ⚡ Prerequisites

To run this project locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB & Redis persistence)

---

## 🚀 Getting Started

### Step 1: Spin up Local Databases (Docker)

In the root directory of the monorepo, spin up MongoDB and Redis in detached mode:

```bash
docker-compose up -d
```

_This starts MongoDB on port `27017` and Redis on port `6379`._

---

### Step 2: Configure Environment Variables

Create `.env` files in both directories according to the templates below.

#### Backend Configuration (`backend/.env`):

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@PrepStackai.mongodb.net/
# OR for local docker: MONGODB_URI=mongodb://localhost:27017/PrepStackai

GEMINI_API_KEY=AIzaSy...   # Your Gemini API Key

# Cloudinary assets keys (for custom teacher avatars & curriculum doc uploads)
CLOUDINARY_CLOUD_NAME=ds0bgdaoo
CLOUDINARY_API_KEY=1458482...
CLOUDINARY_SECRET_KEY=rBZ77...
```

---

### Step 3: Run the Backend & Queue Workers

Open two terminals inside the `backend` folder:

1.  **Install dependencies**:
    ```bash
    cd backend
    npm install
    ```
2.  **Start the Express API server**:
    ```bash
    npm run dev
    ```
    _Starts the server on port `5001`._
3.  **Start the BullMQ worker processor** (in the second terminal):
    ```bash
    npm run worker
    ```

---

### Step 4: Run the Frontend

Open a terminal inside the `frontend` folder:

1.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```
2.  **Start the Next.js development server**:
    ```bash
    npm run dev
    ```
    _Starts the Next.js portal on `http://localhost:3000`._

---

## 🧪 Testing User Sessions Locally

1.  Open your browser to `http://localhost:3000`. You will be intercepted by the auth guard and routed to the gorgeous `/login` column portal.
2.  Register a new account (e.g., `teacherA@gmail.com`). You will be taken to the onboarding flow to set your school details (e.g. _Navyug Convent School_, _New Delhi_).
3.  Fill in the assignment criteria, upload study notes if desired, and click **Create Assignment**. Watch the minimalist stepper dashboard formulating questions via BullMQ.
4.  Download the **Question Paper PDF** and **Answer Key PDF** separately. Verify that clicking standard prints excludes the answers automatically.
5.  Click **Log Out** in the sidebar. Register a second account (`teacherB@gmail.com`). Notice the app forces Onboarding setup again and loads an entirely separate, isolated sandbox dashboard!
