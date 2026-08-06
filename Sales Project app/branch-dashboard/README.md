# Branch Sales Intelligence — Executive BI Dashboard

A production-quality, premium SaaS-style Business Intelligence dashboard for a
company with three branches — **Cairo, Alexandria, Mansoura**. It loads three
Excel files locally (no database), merges them into one master dataset, and
renders an executive analytics experience with role-based access, dynamic
filters, 20+ visualizations, AI-style insights, and PDF/Excel export.

Built to deploy directly to **Vercel**.

---

## ✨ Features

- **Local Excel data source** — three `.xlsx` files in `public/data/` are fetched
  and parsed in the browser with SheetJS, merged, normalized, and cached. No backend, no DB.
- **Role-based access (4 roles)** — a Manager who sees everything, and three branch
  managers who are **hard-scoped to their own branch**. Branch rows for other branches
  never enter a branch user's dataset, and manager-only routes redirect branch users
  away even if they edit the URL.
- **15 animated KPI cards** — revenue, profit, orders, customers, AOV, margin, MoM
  growth, quantity, best/worst product, best category, latest-month figures, YTD revenue.
- **Global filter panel** — branch, category, product, payment method, month, quarter,
  segment, channel, order status, salesperson, date range, unit-price range, and global
  search. Every chart updates instantly.
- **20+ visualizations** — revenue trend, revenue vs profit, daily sales, branch bars,
  revenue-share donut, category bar, product treemap, quantity/profit bubble scatter,
  branch×month heatmap, stacked category-by-branch, payment donut, segment/channel pies,
  top/bottom products, top customers, and more (Recharts).
- **Branch Comparison (Manager only)** — performance scores, ranking, highlights
  (best / fastest-growing / most profitable / top revenue) and a full comparison matrix.
- **AI Insights** — deterministic, data-grounded business insights generated live from
  the current selection.
- **Reports** — Export to PDF (jsPDF), Export to Excel (SheetJS), and Print.
- **Professional data table** — TanStack Table with sorting, global search, pagination,
  and a sticky header.
- **Premium UI/UX** — glassmorphism, gradients, soft shadows, Framer Motion animations,
  loading skeletons, fully responsive, and light/dark mode.

## 🧱 Tech Stack

Next.js 15 (App Router) · TypeScript · TailwindCSS · shadcn/ui-style primitives (Radix) ·
Framer Motion · Recharts · React Hook Form + Zod · Zustand · TanStack Table · date-fns ·
SheetJS (xlsx) · jsPDF · lucide-react · next-themes.

## 🔐 Demo Accounts

| Role              | Username   | Password       | Sees                          |
| ----------------- | ---------- | -------------- | ----------------------------- |
| Manager           | `manager`  | `Manager@123`  | All branches + comparison     |
| Cairo Branch      | `cairo`    | `Cairo@123`    | Cairo only                    |
| Alexandria Branch | `alex`     | `Alex@123`     | Alexandria only               |
| Mansoura Branch   | `mansoura` | `Mansoura@123` | Mansoura only                 |

> ⚠️ **Security note:** authentication is **client-side only** for this demo. The
> credentials live in the JavaScript bundle and provide **no real security**. For
> production, move auth behind a backend or an identity provider (NextAuth, Clerk,
> Supabase Auth, etc.). This is documented in the app's Settings page too.

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Run in development
npm run dev
# open http://localhost:3000

# 3. Production build (verified working)
npm run build
npm start
```

## ▲ Deploy to Vercel

1. Push this folder to a GitHub/GitLab repo.
2. Go to <https://vercel.com/new> and import the repo.
3. Framework preset: **Next.js** (auto-detected). No env vars needed.
4. Click **Deploy**. That's it.

Or from the CLI:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

The three Excel files ship inside `public/data/` and are served statically, so the
dashboard works on Vercel with zero configuration.

### Optional: re-enable Google Fonts (Inter)

To keep the build self-contained and offline-friendly, this project uses a native
system font stack. On Vercel you can switch to the Inter web font if you prefer — add
back `next/font/google` in `src/app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
// then add `${inter.variable}` to <body className=...>
```

## 📊 Swapping in your own data

Replace the files in `public/data/` (`cairo.xlsx`, `alexandria.xlsx`, `mansoura.xlsx`).
The parser in `src/lib/excel.ts` is tolerant to column spacing and `(EGP)` / `%`
suffixes and maps these columns:

`Order ID · Order Date · Branch · City / Area · Salesperson · Customer Name ·
Customer Segment · Sales Channel · Product Category · Product · Quantity ·
Unit Price (EGP) · Discount % · Gross Sales (EGP) · Net Sales (EGP) ·
Unit Cost (EGP) · Total Cost (EGP) · Profit (EGP) · Profit Margin % ·
Payment Method · Order Status · Customer Rating`

Revenue is taken from **Net Sales (EGP)**. The branch is enforced from the filename
mapping, so a stray `Branch` value in a sheet can't leak a row into the wrong branch.

> Note: the source data has no dedicated *sub-category* column, so the "sub-level"
> views use **Product** under **Product Category**.

## 🗂 Project Structure

```
public/data/                 # cairo.xlsx, alexandria.xlsx, mansoura.xlsx (data source)
src/
  app/
    layout.tsx               # root layout + theme provider
    page.tsx                 # entry redirect (login/dashboard)
    login/page.tsx           # premium login (RHF + Zod)
    (dash)/
      layout.tsx             # auth guard + data provider + sidebar + topbar
      dashboard/             # executive overview
      analytics/             # treemap, heatmap, scatter, stacked, daily
      sales/                 # payment/channel mix + data table
      customers/             # top customers, segments, contribution table
      products/              # top/bottom products, product table
      comparison/            # MANAGER ONLY — branch comparison & ranking
      insights/              # AI insights
      reports/               # export center (PDF / Excel / Print)
      settings/              # theme, account, data reload
  components/
    ui/                      # shadcn-style primitives (button, card, select, table…)
    layout/                  # sidebar, topbar, theme toggle
    providers/               # theme, data, auth-guard
    dashboard/               # kpi cards, filter panel, insights panel, page states
    charts/                  # all Recharts components + chart card + tooltip
    data-table/              # TanStack table
    reports/                 # export buttons
  hooks/use-filtered-records.ts   # role scoping + all filters (single source of truth)
  lib/                       # excel, metrics, insights, export, auth, format, utils
  stores/                    # zustand: auth (persisted) + filters
  types/                     # shared TypeScript types
```

## 🧠 Architecture Notes

- **Single source of truth for "what the view sees":** `useFilteredRecords()` applies
  **role scoping first** (non-negotiable), then UI filters. Every page/chart reads from it.
- **Data loads once** via `DataProvider` (React context) and is reused across pages.
- **State:** Zustand for auth (localStorage-persisted) and filters (in-memory).
- **Type safety:** strict TypeScript throughout; the production build type-checks cleanly.

## 📜 License

Provided for the requester's use. Data files are sample/synthetic sales data.
