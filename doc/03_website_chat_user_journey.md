# User Journey & User Flow
## Website + Integrated Chat Agent
### Mazaya Clinics — Agentic Facility Manager PoC

**Document ID:** MZ-UJ-001  
**Version:** 1.0  
**Date:** May 2025

---

## 1. User Personas

### Persona A — Prospective Tenant (Dr. / Medical Group)
A practising specialist or a medical group looking to lease clinic space in one of Mazaya's 8 towers. Typically discovers Mazaya via referral, Google, or the existing mazayaholding.com website. May speak Arabic or English. Primary action: **enquire about clinic space.**

### Persona B — Existing Tenant (Doctor / Clinic Operator)
An existing clinic tenant in one of the 8 towers. Has an established relationship with Mazaya FM. Needs to raise maintenance issues or request facility services (signage, display, lighting, etc.). Primarily communicates via WhatsApp today (no digital channel). Primary actions: **report maintenance, request services.**

### Persona C — Vendor / Supplier
A technical services company (electrical, MEP, HVAC, signage, etc.) looking to join the Mazaya empaneled supplier network. Currently registers via a basic web form. Primary action: **register as a vendor.**

---

## 2. Website Information Architecture

The website mirrors the structure of mazayaholding.com, adapted to the Mazaya Clinics context.

```
Home
├── About Us
│   ├── Overview
│   ├── Al Mazaya Profile
│   ├── Group Structure
│   └── Board of Directors
├── Operations (Mazaya Clinic)
│   ├── All Towers (index)
│   ├── Clinic I — Clover Centre, Al Jabriya
│   ├── Clinic II — Sabah Al Salim
│   ├── Clinic III — Bneid Al Gar
│   ├── Clinic IV — Hawally
│   ├── Clinic V — Jabriya
│   ├── Clinic VI — Salmiya
│   ├── Clinic VII — Jahra
│   └── Clinic VIII — Sabah Al Salem
├── Services
│   ├── Clinic Space Leasing
│   ├── Facility Services
│   ├── Maintenance
│   └── Vendor Registration
├── Investor Relations
│   ├── Financial Highlights
│   └── Announcements
├── Media Center
│   ├── Press Releases
│   └── News
└── Contact Us
```

**Persistent elements on every page:**
- Top utility bar: AR/EN toggle, Customer Care, Contact Us, E-Login (mirroring mazayaholding.com)
- Main navigation (green background, white text — matching brand)
- Floating chat button (bottom-right, Mazaya green, "Talk to Us" label)
- Footer: links to Vendor Registration, Sitemap, Privacy Policy, Related Websites

---

## 3. Website Design Reference

The website must closely replicate the visual design of mazayaholding.com:

| Element | Specification |
|---|---|
| Primary brand colour | #005B41 (Mazaya green) |
| Navigation bar | Green background (#005B41), white text, dropdown menus |
| Top utility bar | Dark/black background, small text, flag icons for language |
| Hero/banner | Full-width image carousel with overlaid text and CTAs |
| Section headings | Uppercase, bold, with coloured underline accent |
| Body font | Clean sans-serif (Segoe UI / system stack) |
| Project cards | White cards with image, title, description, "view more details" link |
| Footer | Dark green/black background, three-column layout |
| Clinic section heading | "MEDICAL CLINICS — Ready for Rent" (matches existing site) |

---

## 4. Website User Journeys

### Journey W-01 — Prospective Tenant Discovers the Site and Enquires

**Trigger:** User lands on the home page from Google search or direct link.

```
Step 1: Home page loads
  ├── User sees hero banner (clinic towers imagery)
  ├── Sees "MEDICAL CLINICS — Ready for Rent" section
  └── Sees "Talk to Us" floating button (bottom-right)

Step 2: User clicks "Operations > Mazaya Clinic" in navigation
  ├── Clinic index page shows all 8 towers as cards
  └── Each card shows: tower name, location, floors, key features

Step 3: User clicks a specific tower (e.g. Clinic IV — Hawally)
  ├── Tower detail page: description, specifications, gallery, location map
  └── "Enquire for Space" CTA button visible

Step 4: User clicks "Enquire for Space"
  └── Chat widget opens as modal popup, pre-loaded to UC-01 Lead Qualification flow
      → Continue to Chat Journey C-01

Step 5 (alternative): User clicks floating "Talk to Us" button from any page
  └── Chat widget opens as modal popup with use case selection menu
      → Continue to Chat Journey C-00 (entry / intent detection)
```

**Outcome:** Lead qualification completes; lead record created; confirmation shown in chat.

---

### Journey W-02 — Existing Tenant Reports a Maintenance Issue

**Trigger:** Tenant visits the website to report an issue (current channel: phone/WhatsApp, new channel: web).

```
Step 1: Tenant navigates to website (home page or direct link)
  └── Sees "Talk to Us" button

Step 2: Tenant clicks "Talk to Us"
  └── Chat widget opens

Step 3: Tenant types or selects "Maintenance request"
  └── Agent routes to UC-03 Maintenance flow
      → Continue to Chat Journey C-03
```

---

### Journey W-03 — Tenant Requests a Facility Service

**Trigger:** Tenant wants to install a digital display board or request a service upgrade.

```
Step 1: Tenant navigates to Services > Facility Services page
  ├── Page lists available services with brief descriptions
  └── "Request Service" CTA button opens chat

Step 2: Alternatively, tenant uses "Talk to Us" button
  └── Agent detects intent: "facility service" or "install"
      → Routes to UC-02 flow
      → Continue to Chat Journey C-02
```

---

### Journey W-04 — Vendor Registers

**Trigger:** A technical services company wants to join the Mazaya vendor network.

```
Step 1: Vendor visits footer link "Vendor Registration"
  └── Page loads with information about the vendor network and a "Register" CTA

Step 2: Vendor clicks "Register"
  └── Chat widget opens pre-loaded to UC-04 Vendor Onboarding flow
      → Continue to Chat Journey C-04
```

---

## 5. Chat Widget — Entry and Intent Detection (C-00)

When the chat widget opens without a specific pre-loaded context, the agent presents an intent menu.

```
AGENT: "Hello! Welcome to Mazaya Clinics. I'm your AI facility assistant.
        How can I help you today?"

Quick replies:
  [ Clinic space enquiry ]  [ Report maintenance ]  [ Request service ]
  [ Vendor registration  ]  [ Other question      ]

User selects → Agent routes to corresponding flow (C-01 through C-04)

Language toggle (EN | عربي) visible at all times in widget header
  → Switching language restarts flow in selected language
```

---

## 6. Chat Journey C-01 — Lead Qualification (UC-01)

**Entry:** "Clinic space enquiry" selected, or chat opened from "Enquire for Space" on a clinic card.

```
AGENT: "I'll help you find the right clinic space. Let me ask a few quick questions."

STEP 1 — Specialty
  AGENT: "What medical specialty will you be practising?"
  Quick replies: [ Cardiology ] [ Dentistry ] [ Paediatrics ]
                 [ Orthopaedics ] [ Ophthalmology ] [ Other ]
  User selects or types specialty.

STEP 2 — Size
  AGENT: "How many consultation rooms do you need approximately?"
  Quick replies: [ 2–3 rooms (small) ] [ 4–6 rooms (medium) ] [ 7+ rooms (large) ] [ Not sure ]

STEP 3 — Tower / Location Preference
  AGENT: "Which area of Kuwait do you prefer?"
  Quick replies: [ Hawally ] [ Jabriya ] [ Salmiya ] [ Bneid Al Gar ] [ Jahra ] [ No preference ]

STEP 4 — Budget Range
  AGENT: "What is your approximate monthly budget for the clinic space?"
  Quick replies: [ Under KD 800/mo ] [ KD 800–1,500/mo ] [ KD 1,500–2,500/mo ] [ Above KD 2,500 ] [ Prefer not to say ]

STEP 5 — Timeline
  AGENT: "When are you looking to open your clinic?"
  Quick replies: [ Within 1 month ] [ 1–3 months ] [ 3–6 months ] [ Just exploring ]

STEP 6 — Contact Details
  AGENT: "Great! What is your name and best contact number?"
  User types: name and phone number (free text)

SCORE CALCULATION (backend):
  Specialty match (if tower has that specialty available):  0–30
  Budget fit (if budget aligns with tower pricing):         0–25
  Timeline urgency (within 1 month = 25, exploring = 5):   0–25
  Tower availability (availability signal):                 0–20
  Total: 0–100

SCORE OUTPUT:
  ≥ 70: AGENT displays "Your enquiry score: 82/100 — Hot Lead ✅"
        "Best match: Mazaya Clinic IV, Hawally — available units on floors 7–10."
        "Our leasing team will contact you within 2 hours."
  40–69: "Your enquiry is in our active pipeline."
         "We will follow up within 24 hours."
  < 40:  "Thank you for your interest. We have noted your details
          and will reach out when a matching space becomes available."

BACKEND ACTION:
  → create_lead() called with all collected data + score + tier
  → Lead record created in database
  → Admin panel Lead Pipeline updates in real-time

AGENT: "Is there anything else I can help you with?"
  Quick replies: [ Ask another question ] [ Visit our website ] [ End chat ]
```

---

## 7. Chat Journey C-03 — Maintenance Request (UC-03)

**Entry:** "Report maintenance" selected, or intent detected from free text.

```
STEP 1 — Location
  AGENT: "I'll log your maintenance request. Which tower are you in?"
  Quick replies: [ Clinic I ] [ Clinic II ] [ Clinic III ] [ Clinic IV ]
                 [ Clinic V ] [ Clinic VI ] [ Clinic VII ] [ Clinic VIII ]

STEP 2 — Floor + Clinic
  AGENT: "Which floor and clinic number?"
  User types: e.g. "Floor 9, Clinic 912"

STEP 3 — Issue Type
  AGENT: "What type of issue are you experiencing?"
  Quick replies: [ Air conditioning / HVAC ] [ Electrical fault ] [ Plumbing / water ]
                 [ Lift / elevator ] [ Fire system ] [ Medical gas ] [ Civil / structural ] [ Other ]

STEP 4 — Description
  AGENT: "Please describe the issue briefly."
  User types: free text description

PRIORITY CLASSIFICATION (backend):
  P1 Critical (2-hr SLA): fire system, structural flooding, total power failure, medical gas
  P2 Operational (8-hr SLA): HVAC failure, partial electrical, plumbing leak, lift out of service
  P3 Routine (48-hr SLA): minor civil, cleaning, non-critical electrical, pest

TICKET CREATION:
  AGENT: "Understood. I've logged your request."
         "🎫 Ticket: MX-2407 | Priority: P2 — Operational"
         "SLA: Resolution expected within 8 hours"
         "Dispatching to available vendor now..."
         (brief pause)
         "Assigned to: Kuwait Electrical Services | Expected response: within 45 minutes"
         "You will receive updates as the job progresses."

VENDOR DISPATCH (backend):
  → create_ticket() called
  → dispatch_vendor() selects best vendor by score × availability × tower proximity
  → Job card sent via admin panel notification
  → SLA clock starts

AGENT: "Is there anything else I can help with?"
```

---

## 8. Chat Journey C-02 — Facility Service Request (UC-02)

**Entry:** "Request service" selected, or intent detected (e.g. "install", "signage", "display").

```
STEP 1 — Service Type
  AGENT: "What facility service do you need?"
  Quick replies: [ Digital display / LED screen ] [ Clinic signage ] [ Partition walls ]
                 [ Lighting upgrade ] [ CCTV / security cameras ] [ Other ]

STEP 2 — Specification
  (Varies by service type)
  For LED screen:
    AGENT: "What screen size?"
    Quick replies: [ 32" ] [ 43" ] [ 55" ] [ Custom ]
    AGENT: "Do you need content management software?"
    Quick replies: [ Yes, include CMS ] [ No, screen only ]

  For signage:
    AGENT: "Where will the signage be placed?"
    Quick replies: [ Clinic door ] [ Waiting area ] [ Lobby directory ] [ Multiple locations ]
    AGENT: "Do you have existing brand guidelines / artwork?"
    Quick replies: [ Yes, I'll provide files ] [ No, need design too ]

STEP 3 — Timeline
  AGENT: "When would you like this completed?"
  Quick replies: [ As soon as possible ] [ Within 2 weeks ] [ Within a month ] [ Flexible ]

STEP 4 — Quote Generation
  AGENT: "Generating your quote..."
  (backend calls get_quote() with rate card)

  AGENT displays itemised quote:
  "📋 Service Quote — FS-0443
   ─────────────────────────────
   55" Commercial LED display    KD 240
   Wall mounting + cabling        KD 45
   CMS software (annual)          KD 60
   Tower access + installation    KD 35
   ─────────────────────────────
   Total                         KD 380
   ─────────────────────────────
   ✅ Auto-approved (below KD 500 threshold)
   Work can be scheduled within 3–5 working days."

STEP 5 — Acceptance
  Quick replies: [ Confirm order ] [ I'd like to negotiate ] [ Ask a question ]

  If "Confirm order":
    AGENT: "✅ Order confirmed. Work order FS-0443 created."
    AGENT: "Our vendor Digital Vision KW will contact you to schedule installation."
    → create_work_order() called
    → dispatch_vendor() called

  If "I'd like to negotiate":
    AGENT: "I can offer up to a 10% adjustment on this quote. Would KD 342 work for you?"
    (±10% tolerance built into agent instructions)

APPROVAL BRANCH (backend):
  If quote > KD 500 (configurable):
    AGENT: "This quote requires FM manager approval. I've sent it for review."
    AGENT: "You'll receive a response within 2 hours."
    → work_order created with status: PENDING_APPROVAL
    → Alert appears in admin panel for FM manager
```

---

## 9. Chat Journey C-04 — Vendor Onboarding (UC-04)

**Entry:** Vendor registration page CTA, or "Vendor registration" intent detected.

```
STEP 1 — Company name (free text)

STEP 2 — Service category
  Quick replies: [ Electrical ] [ Plumbing / MEP ] [ HVAC ] [ Civil / Fit-out ]
                 [ Digital signage ] [ Cleaning ] [ Security / CCTV ] [ Pest control ] [ Other ]
  (Multi-select allowed)

STEP 3 — Tower coverage
  Quick replies: [ All towers ] [ Specific towers only ]
  If specific: multi-select tower list

STEP 4 — Contact details
  AGENT: "Your company contact name, phone, and email?"
  User types: free text

STEP 5 — Trade Licence Number
  AGENT: "Your Kuwait trade licence number?"
  User types: free text

STEP 6 — Summary + Confirmation
  AGENT: "Here's your registration summary:
  📋 Vendor Application — VAP-0090
  Company: [name]
  Categories: [list]
  Coverage: [towers]
  Initial score: 70/100

  Next steps:
  1. Our FM team will verify your trade licence within 24 hours.
  2. You'll receive a confirmation email with a portal link to upload documents.
  3. Once approved, you'll receive job cards via this chat or WhatsApp (once enabled).

  Welcome to the Mazaya vendor network! 🤝"

  → register_vendor() called
  → Vendor record created with status: ONBOARDING
  → Alert appears in admin panel Vendor Registry
```

---

## 10. Arabic Language Flow

The chat agent supports full Arabic conversation. The language toggle in the widget header switches:
- All agent messages to Arabic (pre-translated system prompts + Claude Arabic capability)
- Quick reply button labels to Arabic
- Widget layout to RTL (right-to-left)
- Input field direction to RTL

All user journeys (C-01 through C-04) are available in Arabic with identical flow logic. The backend stores the language preference on the session record.

**Sample Arabic flow excerpt — UC-01:**
```
وكيل: "أهلاً وسهلاً! مرحباً بكم في مزايا كلينك. أنا مساعدكم الذكي للمرافق.
       كيف يمكنني مساعدتكم اليوم؟"

أزرار الردود السريعة:
  [ الاستفسار عن مساحة عيادة ] [ الإبلاغ عن صيانة ] [ طلب خدمة ]
  [ تسجيل مورد ] [ سؤال آخر ]
```

---

## 11. Chat Widget UX Specifications

| Element | Specification |
|---|---|
| Widget trigger | Floating circular button, bottom-right, Mazaya green (#005B41), "💬 Talk to Us" label |
| Widget dimensions | 420px wide × 620px tall (desktop); full-screen on mobile |
| Widget header | Mazaya green background, AI agent avatar, "Mazaya AI Assistant" name, online status, EN/AR toggle |
| Message bubbles | Agent: light grey background, left-aligned. User: Mazaya green background, right-aligned |
| Quick reply buttons | Pill-shaped, grey background with green border on hover |
| Typing indicator | Three animated dots |
| Input field | Rounded, with send button (arrow icon) |
| Structured outputs | Quote tables, score cards, ticket references rendered as formatted cards within the chat bubble |
| Modal behaviour | Clicking outside the widget does not close it (prevents accidental dismissal mid-flow) |
| Close button | × in top-right corner of widget header |
| Persistent state | Widget state (open/closed, current conversation) persists across page navigations within the same browser session |
