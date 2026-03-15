# ILOT COCO BEACH - Project Presentation
## Full-Stack Web Application - Technical & Business Proposal

---

## SLIDE 1: PROJECT OVERVIEW

**Client:** Ilot Coco Beach (Iloc CocoBeach)
**Type:** Beach restaurant & leisure business
**Goal:** Full-stack website with backoffice, customer engagement, and online presence management

**What we are building:**
- A public-facing website showcasing the beach experience
- A customer-facing reservation and voucher system
- A full backoffice for the business to manage content, menus, vouchers, feedback, and flash sales
- Integration with WhatsApp, Instagram, and Facebook Messenger

---

## SLIDE 2: FEATURE MAP

### Public Website (Customer-Facing)
| # | Feature | Description |
|---|---------|-------------|
| 1 | **Hero/Cover Video** | Full-screen video landing with brand identity |
| 2 | **About / Discover** | Business story, unique selling points |
| 3 | **Menu / Plats** | Two versions: Standard and Extra, with prices and images |
| 4 | **Gallery** | Photo gallery managed from backoffice |
| 5 | **Emplacements** | Showcase spaces: cabanes, pied en mer, plage, balade pirate |
| 6 | **Vouchers / Promos** | Active vouchers and discount codes displayed prominently |
| 7 | **Vente Flash** | Time-limited flash sales with countdown timer |
| 8 | **Reviews / Feedback** | Customer reviews (admin-approved visibility) |
| 9 | **Social Links** | WhatsApp, Instagram, Facebook Messenger redirect buttons |
| 10 | **Location & Contact** | Google Maps embed, phone, directions |
| 11 | **Multi-language** | French, Arabic, English |

### User System
| # | Feature | Description |
|---|---------|-------------|
| 12 | **Sign Up / Login** | Email or phone + password |
| 13 | **Google / Facebook Login** | Social auth options |
| 14 | **User Profile** | Basic profile with reservation history |
| 15 | **Submit Feedback** | Logged-in users can leave reviews |

### Backoffice (Admin Panel)
| # | Feature | Description |
|---|---------|-------------|
| 16 | **Dashboard** | Overview stats (visits, reservations, active promos) |
| 17 | **Menu Management** | CRUD for menu items (Standard/Extra), prices, images |
| 18 | **Image Management** | Upload, swap, delete images for all sections |
| 19 | **Voucher Management** | Create, edit, activate/deactivate vouchers with codes |
| 20 | **Vente Flash Management** | Schedule flash sales with start/end time and discount % |
| 21 | **Feedback Moderation** | View all reviews, approve/reject/hide visibility |
| 22 | **Emplacement Management** | Edit spaces, descriptions, images, pricing |
| 23 | **Reservation Viewer** | View incoming reservation requests |
| 24 | **Content Management** | Edit about text, hero video, contact info, SEO keywords |
| 25 | **User Management** | View registered users |

### Background Jobs
| # | Feature | Description |
|---|---------|-------------|
| 26 | **Flash Sale Cron** | Auto-activate/deactivate vente flash at scheduled times |
| 27 | **Voucher Expiry Cron** | Auto-expire vouchers past their end date |

---

## SLIDE 3: TECHNICAL ARCHITECTURE

```
+------------------+     +------------------+     +------------------+
|   FRONTEND       |     |    BACKEND       |     |   DATABASE       |
|   Vue.js 3       |<--->|   REST API       |<--->|   PostgreSQL     |
|   TailwindCSS    |     |   + Auth         |     |                  |
|   GSAP Animations|     |   + Cron Jobs    |     |   TABLES:        |
|   Vue Router     |     |   + File Upload  |     |   - users        |
|   Vue I18n       |     |                  |     |   - menus        |
|   Pinia (state)  |     |                  |     |   - menu_items   |
+------------------+     +------------------+     |   - images       |
                                                  |   - vouchers     |
+------------------+     +------------------+     |   - flash_sales  |
|  FILE STORAGE    |     |   HOSTING        |     |   - reviews      |
|  (Images/Video)  |     |   Cloud Provider |     |   - emplacements |
|  S3-compatible   |     |   or VPS         |     |   - reservations |
+------------------+     +------------------+     |   - settings     |
                                                  +------------------+
```

---

## SLIDE 4: BACKEND FRAMEWORK COMPARISON

The client asked about .NET. Here is an honest comparison for THIS specific project:

### Ranking for Ilot Coco Beach (best to least suitable)

#### 1. Node.js (Express or Fastify) - RECOMMENDED
| Criteria | Score |
|----------|-------|
| Development Speed | ★★★★★ - Fastest for REST APIs and CRUD |
| Hosting Cost | ★★★★★ - Cheapest options (Railway $5/mo, Hetzner $3.79/mo) |
| Same Language as Frontend | ★★★★★ - JavaScript/TypeScript everywhere |
| Ecosystem for this project | ★★★★★ - Passport.js (auth), node-cron, multer (uploads), Prisma (ORM) |
| Cron Jobs | ★★★★★ - node-cron, bull queue, or platform cron |
| Developer Availability | ★★★★★ - Largest pool of web developers |
| OVH Migration | ★★★★☆ - Needs VPS with Node runtime or Docker |
| **Total** | **34/35** |

**Why:** Same language as frontend = one developer can handle everything. Fastest to build CRUD admin panels. Cheapest to host.

#### 2. Python (Django + DRF) - STRONG ALTERNATIVE
| Criteria | Score |
|----------|-------|
| Development Speed | ★★★★★ - Django Admin is BUILT-IN (saves weeks) |
| Hosting Cost | ★★★★☆ - Similar to Node.js |
| Same Language as Frontend | ★★☆☆☆ - Different language (Python vs JavaScript) |
| Ecosystem | ★★★★★ - Django REST Framework, Celery (cron), Pillow (images) |
| Cron Jobs | ★★★★★ - Celery + Beat is industry standard |
| Developer Availability | ★★★★☆ - Very common |
| OVH Migration | ★★★★☆ - Needs VPS |
| **Total** | **29/35** |

**Why consider:** Django's built-in admin panel could save 2-3 weeks of backoffice development. However, requires a Python developer in addition to the Vue.js frontend developer.

#### 3. .NET (ASP.NET Core) - CAPABLE BUT HEAVY
| Criteria | Score |
|----------|-------|
| Development Speed | ★★★☆☆ - Slower for CRUD, more boilerplate |
| Hosting Cost | ★★★☆☆ - Azure cheapest at ~$13/mo, or VPS + runtime |
| Same Language as Frontend | ★★☆☆☆ - C# vs JavaScript |
| Ecosystem | ★★★★☆ - Entity Framework, Identity (auth), Hangfire (cron) |
| Cron Jobs | ★★★★☆ - Hangfire or Quartz.NET |
| Developer Availability | ★★★☆☆ - Smaller pool for web, more enterprise-focused |
| OVH Migration | ★★★☆☆ - Needs .NET runtime on VPS |
| **Total** | **22/35** |

**Honest assessment:** .NET is excellent for large enterprise systems, banking, and high-performance APIs. For a beach restaurant website with CRUD operations, it is overengineered. Development will take 30-40% longer, hosting costs more, and you need a C# developer separate from the Vue.js developer.

#### 4. PHP (Laravel) - BUDGET KING
| Criteria | Score |
|----------|-------|
| Development Speed | ★★★★☆ - Fast for CRUD, Laravel Nova for admin |
| Hosting Cost | ★★★★★ - Cheapest: shared hosting works ($3/mo) |
| Same Language as Frontend | ★★☆☆☆ - PHP vs JavaScript |
| Ecosystem | ★★★★☆ - Eloquent ORM, Laravel Sanctum (auth), scheduler |
| Cron Jobs | ★★★★★ - Built-in task scheduler |
| Developer Availability | ★★★★★ - Most common web language globally |
| OVH Migration | ★★★★★ - OVH has native PHP hosting from $2.99/mo |
| **Total** | **29/35** |

**Why consider:** Cheapest to host long-term, especially on OVH. Laravel's task scheduler handles cron jobs natively. OVH's shared hosting supports PHP out of the box.

### VERDICT
**Primary recommendation: Node.js (Fastify + Prisma + PostgreSQL)**
- One language for full stack
- Cheapest cloud hosting
- Fastest development cycle
- Easy to maintain by a single developer

**If OVH shared hosting is mandatory later: Consider Laravel as backend with same Vue.js frontend.**

---

## SLIDE 5: CLOUD PROVIDER COMPARISON

### Option A: Managed Platform (Easiest, slightly more expensive)

| Provider | Backend | Database | Storage | Monthly Cost |
|----------|---------|----------|---------|-------------|
| **Railway** | $5/mo (Hobby) includes $5 credit | PostgreSQL included | N/A (use external) | ~$5-10/mo |
| **Render** | $7/mo (Starter) | PostgreSQL free (90 days) then $7/mo | N/A | ~$7-14/mo |
| **Vercel + Supabase** | Vercel Serverless (free tier) | Supabase free (500MB) | Supabase (1GB free) | $0 (free tiers) |
| **Fly.io** | $0 (3 free VMs) | PostgreSQL $0 (3GB free) | N/A | ~$0-5/mo |

### Option B: VPS (Cheapest long-term, requires setup)

| Provider | VPS Spec | Price/mo | Includes |
|----------|----------|----------|----------|
| **Hetzner CX22** | 2 vCPU, 4GB RAM, 40GB disk | **EUR 3.79** (~$4.10) | 20TB traffic |
| **OVH VPS Starter** | 1 vCPU, 2GB RAM, 20GB disk | **EUR 3.50** (~$3.80) | Unlimited traffic |
| **DigitalOcean** | 1 vCPU, 1GB RAM, 25GB disk | **$6.00** | 1TB traffic |
| **Contabo VPS S** | 4 vCPU, 8GB RAM, 50GB disk | **EUR 4.99** (~$5.40) | 32TB traffic |

### Option C: OVH (Client's preferred migration target)

| OVH Product | Spec | Price/mo | Best For |
|-------------|------|----------|----------|
| Web Hosting Pro | PHP/MySQL, 250GB, 10 sites | EUR 5.49 | Laravel backend |
| VPS Starter | 1 vCPU, 2GB RAM, 20GB | EUR 3.50 | Node.js + Docker |
| VPS Comfort | 2 vCPU, 4GB RAM, 80GB | EUR 7.00 | Full stack + DB |

### Additional Services (needed regardless of hosting)

| Service | Free Tier | Paid Tier | Used For |
|---------|-----------|-----------|----------|
| **Supabase / Neon** | 500MB DB free | $25/mo (Pro) | Database if not self-hosted |
| **Cloudinary** | 25 credits/mo free | $89/mo | Image CDN + transformations |
| **AWS S3 / Cloudflare R2** | R2: 10GB free | $0.015/GB | File storage (images/video) |
| **Domain** | N/A | ~$10-15/year | ilotcocobeach.com |
| **SSL** | Free (Let's Encrypt) | N/A | HTTPS |

### RECOMMENDED STACK (Cost-Optimized)

**Phase 1 - Development & Launch:**
- Frontend: Vercel (free)
- Backend: Railway ($5/mo) or Render ($7/mo)
- Database: Railway PostgreSQL (included) or Supabase (free)
- Storage: Cloudflare R2 (10GB free) or Supabase Storage (1GB free)
- **Total: $5-7/month**

**Phase 2 - Migration to OVH:**
- Everything on Hetzner CX22 or OVH VPS Comfort: **EUR 3.79-7.00/month**
- Self-hosted PostgreSQL + Node.js + Nginx
- Cloudflare (free) for CDN and SSL
- **Total: ~EUR 4-7/month**

---

## SLIDE 6: USER STORIES BACKLOG

### Epic 1: Public Website
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-01 | As a visitor, I see a full-screen cover video when I land on the site | High | 3h |
| US-02 | As a visitor, I can read about the business and its unique features | High | 3h |
| US-03 | As a visitor, I can browse the photo gallery | High | 4h |
| US-04 | As a visitor, I can view the menu (Standard and Extra) with prices | High | 5h |
| US-05 | As a visitor, I can see available emplacements (cabanes, mer, plage) | High | 4h |
| US-06 | As a visitor, I can see active vouchers and promotions | High | 4h |
| US-07 | As a visitor, I see flash sale countdown timers with discounts | Medium | 5h |
| US-08 | As a visitor, I can read approved customer reviews | High | 3h |
| US-09 | As a visitor, I can click to open WhatsApp/Instagram/Messenger | High | 2h |
| US-10 | As a visitor, I can see the location on a map and get directions | Medium | 3h |
| US-11 | As a visitor, I can switch language (FR/AR/EN) | Medium | 6h |
| US-12 | As a visitor, the site loads fast and looks great on mobile | High | 8h |

### Epic 2: User Authentication
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-13 | As a visitor, I can sign up with email/phone + password | High | 6h |
| US-14 | As a visitor, I can sign up/login with Google or Facebook | Medium | 5h |
| US-15 | As a user, I can view/edit my profile | Low | 3h |
| US-16 | As a user, I can reset my password | High | 3h |

### Epic 3: Reservation System
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-17 | As a user, I can fill a reservation form and send it via WhatsApp | High | 4h |
| US-18 | As a user, I can apply a voucher code to my reservation | Medium | 4h |
| US-19 | As a user, I can view my past reservations | Low | 3h |

### Epic 4: Reviews & Feedback
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-20 | As a logged-in user, I can submit a review with text and rating | High | 4h |
| US-21 | As a visitor, I only see admin-approved reviews | High | 2h |

### Epic 5: Backoffice - Content Management
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-22 | As an admin, I can log in to the backoffice securely | High | 4h |
| US-23 | As an admin, I can manage the menu (add/edit/delete items, set Standard/Extra, prices) | High | 8h |
| US-24 | As an admin, I can manage images for all sections (upload, reorder, delete) | High | 6h |
| US-25 | As an admin, I can edit the hero video and cover content | Medium | 3h |
| US-26 | As an admin, I can manage emplacement info (descriptions, images, pricing) | High | 5h |
| US-27 | As an admin, I can edit contact info, about text, and SEO keywords | Medium | 4h |

### Epic 6: Backoffice - Vouchers & Flash Sales
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-28 | As an admin, I can create vouchers with code, discount %, expiry date | High | 6h |
| US-29 | As an admin, I can activate/deactivate vouchers | High | 2h |
| US-30 | As an admin, I can schedule flash sales with start/end time and discount | High | 6h |
| US-31 | The system auto-activates and deactivates flash sales at scheduled times | High | 4h |

### Epic 7: Backoffice - Moderation
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-32 | As an admin, I can view all submitted reviews | High | 3h |
| US-33 | As an admin, I can approve, reject, or hide a review | High | 3h |
| US-34 | As an admin, I can view all reservations received | Medium | 3h |
| US-35 | As an admin, I can view registered users | Low | 2h |

### Epic 8: Backend Infrastructure
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-36 | Set up database schema and migrations | High | 6h |
| US-37 | Set up REST API with authentication middleware | High | 8h |
| US-38 | Set up file storage for images/video | High | 4h |
| US-39 | Set up cron jobs for flash sales and voucher expiry | High | 4h |
| US-40 | Set up deployment pipeline (CI/CD) | Medium | 4h |

---

## SLIDE 7: DEVELOPMENT TIMELINE

### Summary by Epic

| Epic | Stories | Total Hours | Sprints (1 sprint = 1 week) |
|------|---------|-------------|----------------------------|
| Public Website | US-01 to US-12 | 50h | 2 sprints |
| User Auth | US-13 to US-16 | 17h | 1 sprint |
| Reservation | US-17 to US-19 | 11h | 0.5 sprint |
| Reviews | US-20 to US-21 | 6h | 0.5 sprint |
| Backoffice Content | US-22 to US-27 | 30h | 1.5 sprints |
| Vouchers & Flash | US-28 to US-31 | 18h | 1 sprint |
| Backoffice Moderation | US-32 to US-35 | 11h | 0.5 sprint |
| Backend Infrastructure | US-36 to US-40 | 26h | 1.5 sprints |
| **Testing & QA** | Bug fixes, polish | 20h | 1 sprint |
| **Deployment & Launch** | Production setup | 10h | 0.5 sprint |

### TOTAL: ~199 hours / ~9.5 sprints (weeks)

**Realistic timeline with one developer: 10-12 weeks**
**With two developers (frontend + backend parallel): 6-8 weeks**

---

## SLIDE 8: PROJECT COST ESTIMATION

### A. Development Cost

| Approach | Rate | Hours | Total |
|----------|------|-------|-------|
| **Solo Freelancer (Tunisia market)** | 30-50 TND/hr | 200h | 6,000-10,000 TND |
| **Solo Freelancer (International)** | $25-50/hr | 200h | $5,000-10,000 |
| **Small Agency** | $40-80/hr | 200h | $8,000-16,000 |
| **YOU (if you are the developer)** | Your rate | 200h | Your calculation |

*Note: These are market rates for a project of this scope. The client should understand this is a full web application, NOT a simple WordPress site.*

### B. Monthly Hosting Cost (Ongoing)

| Phase | What | Cost/Month |
|-------|------|-----------|
| **Launch (Railway/Render)** | Backend + DB + Frontend (Vercel) + Storage | $5-10 |
| **Production (Hetzner/OVH VPS)** | All-in-one VPS + Cloudflare CDN | EUR 4-7 (~$5-8) |
| **Domain** | .com domain | ~$1/mo (billed yearly) |
| **Total ongoing** | | **$6-15/month** |

### C. Suggested Pricing to Client

| Item | Price Range |
|------|------------|
| **Website Development** (all features) | 8,000 - 15,000 TND |
| **Monthly Maintenance** (hosting + updates + support) | 150 - 300 TND/month |
| **OR: Fixed project + hosting** | 10,000 TND + 200 TND/month |

*Adjust based on your relationship with the client and local market rates.*

---

## SLIDE 9: WHAT THE CLIENT GETS

### Deliverables
1. Fully responsive website (desktop, tablet, mobile)
2. Full backoffice to manage everything independently
3. User registration and review system
4. Voucher and flash sale engine with automation
5. Multi-language support (FR/AR/EN)
6. WhatsApp/Instagram/Messenger integration
7. SEO-optimized with configurable keywords
8. Source code ownership
9. Documentation for backoffice usage
10. 3 months of post-launch support

### What the client manages themselves (after launch):
- All photos and videos
- Menu items and prices
- Vouchers and promotions
- Flash sales scheduling
- Review moderation
- Contact info and SEO keywords

### What requires developer intervention:
- New features
- Language additions
- Major design changes
- Server migration

---

## SLIDE 10: NEXT STEPS

1. **Client Approval** - Approve scope, features, and budget
2. **Account Setup** - Create hosting accounts (Railway/Hetzner + Supabase/Neon)
3. **Sprint 1-2** - Backend infrastructure + Public website frontend
4. **Sprint 3-4** - User auth + Menu + Gallery + Emplacements
5. **Sprint 5-6** - Backoffice (content, menus, images)
6. **Sprint 7-8** - Vouchers, flash sales, reviews, cron jobs
7. **Sprint 9-10** - Testing, QA, deployment, launch
8. **Post-Launch** - Monitoring, bug fixes, SEO optimization

---

## APPENDIX: DATABASE SCHEMA (Technical Reference)

```
users
  - id (UUID, PK)
  - email (VARCHAR, unique, nullable)
  - phone (VARCHAR, unique, nullable)
  - password_hash (VARCHAR)
  - name (VARCHAR)
  - role (ENUM: user, admin)
  - provider (ENUM: email, google, facebook)
  - created_at (TIMESTAMP)

menu_categories
  - id (UUID, PK)
  - name_fr, name_en, name_ar (VARCHAR)
  - sort_order (INT)

menu_items
  - id (UUID, PK)
  - category_id (FK)
  - name_fr, name_en, name_ar (VARCHAR)
  - description_fr, description_en, description_ar (TEXT)
  - price_standard (DECIMAL)
  - price_extra (DECIMAL)
  - image_url (VARCHAR)
  - is_available (BOOLEAN)
  - sort_order (INT)

emplacements
  - id (UUID, PK)
  - name_fr, name_en, name_ar (VARCHAR)
  - description_fr, description_en, description_ar (TEXT)
  - price (DECIMAL)
  - image_url (VARCHAR)
  - capacity (INT)
  - sort_order (INT)

images
  - id (UUID, PK)
  - url (VARCHAR)
  - section (ENUM: hero, gallery, menu, emplacement)
  - alt_text (VARCHAR)
  - sort_order (INT)

vouchers
  - id (UUID, PK)
  - code (VARCHAR, unique)
  - discount_percent (INT)
  - discount_amount (DECIMAL, nullable)
  - valid_from (TIMESTAMP)
  - valid_until (TIMESTAMP)
  - max_uses (INT)
  - current_uses (INT)
  - is_active (BOOLEAN)

flash_sales
  - id (UUID, PK)
  - title_fr, title_en, title_ar (VARCHAR)
  - description_fr, description_en, description_ar (TEXT)
  - discount_percent (INT)
  - starts_at (TIMESTAMP)
  - ends_at (TIMESTAMP)
  - is_active (BOOLEAN)
  - image_url (VARCHAR)

reviews
  - id (UUID, PK)
  - user_id (FK)
  - rating (INT, 1-5)
  - comment (TEXT)
  - is_approved (BOOLEAN, default false)
  - is_visible (BOOLEAN, default false)
  - created_at (TIMESTAMP)

reservations
  - id (UUID, PK)
  - user_id (FK, nullable)
  - name (VARCHAR)
  - phone (VARCHAR)
  - date (DATE)
  - guests (INT)
  - message (TEXT)
  - voucher_id (FK, nullable)
  - status (ENUM: pending, confirmed, cancelled)
  - created_at (TIMESTAMP)

site_settings
  - key (VARCHAR, PK)
  - value (TEXT)
  -- Stores: phone, address, lat, lng, about_text, seo_keywords, etc.
```

---

*Document prepared for Ilot Coco Beach project presentation.*
*All costs are estimates as of March 2026 and subject to provider pricing changes.*
