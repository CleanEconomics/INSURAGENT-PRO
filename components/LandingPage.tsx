import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Gift,
  Trophy,
  Target,
  TrendingUp,
  Users,
  CalendarDays,
  BarChart4,
  ClipboardList,
  TicketCheck,
  Workflow,
} from "lucide-react";

/**
 * InsurAgent Pro — Alex Hormozi–Style Landing Page
 * High-contrast, bold promise, value stack, risk-reversal, social proof, scarcity.
 * TailwindCSS + Framer Motion + Lucide icons
 * Author: OptiSyn Solutions (SDVOSB)
 */

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
    <div className="text-2xl font-extrabold text-white">{value}</div>
    <div className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</div>
  </div>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm leading-relaxed">
    <CheckCircle2 className="mt-[2px] size-5 text-amber-500" />
    <span>{children}</span>
  </li>
);

export default function InsurAgentProLanding() {
  const [annual, setAnnual] = useState(true);
  const price = (m: number, a: number) => (annual ? a : m);

  const faqs = [
    {
      q: "How fast is the pilot?",
      a: "14 days. We launch one workflow that moves a metric (held appointments, quote speed, or renewals).",
    },
    {
      q: "Does this replace our current CRM?",
      a: "It can, but it doesn't have to. Most teams start by connecting calendar, email, and leads, then expand.",
    },
    {
      q: "Is the Assistant safe for client comms?",
      a: "Yes. You control tone, guardrails, and approvals. All actions are logged with auditability.",
    },
    {
      q: "Migrations?",
      a: "Use our CSV importer with field mapping. For complex migrations, we can recommend partners or provide guidance.",
    },
    {
      q: "What's included in the 14‑day pilot?",
      a: "A focused setup: pipeline + CRM basics, appointment workflow, Assistant prompts, and simple follow‑up templates. We aim at one measurable outcome.",
    },
    {
      q: "Do you support SMS and email? Are we TCPA compliant?",
      a: "Yes. Native email + SMS with opt‑in/opt‑out controls and a Do‑Not‑Contact list. You own consent management; we provide tools and logs to help you stay compliant.",
    },
    {
      q: "How do you measure the ROI guarantee?",
      a: "We track agent time saved (automations + Assistant tasks) and leading indicators like held appointments and response times. If we don't hit 10+ hrs/agent/month in 90 days, your subscription is credited until we do.",
    },
    {
      q: "What if my team doesn't adopt it?",
      a: "We provide playbooks, quick videos, and in‑app prompts. During the pilot we keep scope tight so reps only learn what they use daily.",
    },
    {
      q: "Calendar integrations?",
      a: "Google Calendar two‑way sync is supported. Outlook/Office 365 is on the roadmap; ask us about current timelines.",
    },
    {
      q: "Who owns our data? Can we export?",
      a: "You own your data. You can export contacts, activities, and pipeline records on request or via built‑in export tools.",
    },
    {
      q: "Security & permissions?",
      a: "Role‑based access, audit logs, and restricted views by team. Admins control who sees leads, deals, and messages.",
    },
    {
      q: "Contracts and billing?",
      a: "Month‑to‑month by default with annual discounts. Cancel anytime; access continues through the paid period.",
    },
    {
      q: "Seat minimums?",
      a: "No hard minimums. Pricing is per user; add or remove seats as your team changes.",
    },
    {
      q: "Implementation options?",
      a: "DIY with our templates, or choose the Guided Setup Accelerator (workshops + team training).",
    },
    {
      q: "Branding?",
      a: "Add your logo, colors, email/SMS templates, and pipeline names. Advanced white‑label options are available on the Scale plan.",
    },
    {
      q: "Dialer support?",
      a: "Click‑to‑call and call logging are supported. Many teams pair us with their preferred dialer via integration.",
    },
    {
      q: "Lead sources (Facebook, QuoteWizard, Zapier)?",
      a: "Yes. Use CSV import, webhooks, or Zapier to route new leads directly into the right pipeline and sequence.",
    },
    {
      q: "Multi‑location or teams?",
      a: "Yes. Create teams, assign managers, segment views, and compare performance on leaderboards.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-amber-500 text-black flex items-center justify-center text-[11px] font-extrabold tracking-wide">IA</div>
            <div className="text-sm font-semibold tracking-wide">InsurAgent Pro</div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <a href="#offer" className="hover:text-white">Offer</a>
            <a href="#features" className="hover:text-white">Product</a>
            <a href="#proof" className="hover:text-white">Proof</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="#demo" className="rounded-lg px-4 py-2 text-sm border border-zinc-800 hover:bg-zinc-900">Book a demo</a>
            <a href="#offer" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold bg-amber-500 text-black">Start pilot <ArrowRight className="size-4"/></a>
          </div>
        </div>
      </nav>

      {/* SCARCITY STRIP */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-2 text-xs flex items-center gap-2 text-zinc-300">
          <Flame className="size-4 text-amber-500"/> Only 10 pilot slots this month — first come, first served
        </div>
      </div>

      {/* HERO */}
      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Built by OptiSyn Solutions • SDVOSB</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-black leading-[1.02] tracking-tight text-white">
              More held appointments in 14 days.
            </h1>
            <p className="mt-5 text-lg text-zinc-300 max-w-xl">
              Launch the core system fast. Prove results. Then add layers.
            </p>
            <div className="mt-7 grid sm:grid-cols-3 max-w-lg gap-3">
              <Stat value="10+ hrs/mo" label="Saved per agent" />
              <Stat value="+22%" label="Held appointments" />
              <Stat value="35% faster" label="Proposal turnaround" />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#offer" className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold bg-amber-500 text-black">Start your 14‑day pilot <ArrowRight className="size-5"/></a>
              <a href="#offer" className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold border border-zinc-800 hover:bg-zinc-900">See everything you get</a>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[12px] text-zinc-400">
              <ShieldCheck className="size-4 text-amber-500"/>
              <span>90‑day ROI guarantee: save 10+ hours/agent/month or your subscription is free until you do.</span>
            </div>
          </motion.div>

          {/* Product Frame */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
            <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl">
              <div className="h-10 border-b border-zinc-800 bg-zinc-950" />
              <div className="p-6 grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-xl border border-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-zinc-100">Sales performance</div>
                    </div>
                    <div className="mt-3 w-full h-28 bg-zinc-800 rounded-md" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["New Leads","Appointments","Policies"].map((t, i) => (
                      <div key={t} className="rounded-xl border border-zinc-800 p-3">
                        <div className="text-xs text-zinc-400">{t}</div>
                        <div className="text-xl font-bold mt-1 text-white">{[38,12,8][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-zinc-800 p-3">
                    <div className="text-sm font-semibold text-zinc-100">Assistant</div>
                    <div className="mt-2 text-xs text-zinc-400">"Draft renewal email for M. Garcia" → <span className="text-amber-500 font-semibold">Ready</span></div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 p-3">
                    <div className="text-sm font-semibold text-zinc-100">Today</div>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                      <li>10:00 • Policy Review – J. Doe</li>
                      <li>1:30 • Recruit Interview – A. Patel</li>
                      <li>3:00 • Team Standup</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-zinc-800 p-3">
                    <div className="text-sm font-semibold text-zinc-100">Leaderboard</div>
                    <div className="mt-2 h-16 bg-zinc-800 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* OFFER STACK (Value > Price) */}
      <section id="offer" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Here's what you get</h2>
            <p className="mt-2 text-zinc-300">Launch the core system fast. Prove results. Then add layers.</p>
            <ul className="mt-6 space-y-3">
              <Bullet>Pipeline + CRM configured for your lines (P&C, Life/Health)</Bullet>
              <Bullet>Assistant set up with your scripts, tone, and approval rules</Bullet>
              <Bullet>Automations for instant lead reply, appointment sequences, renewals</Bullet>
              <Bullet>Calendar, tasks, and recruiting pipeline connected day one</Bullet>
              <Bullet>Team enablement (playbooks, templates), KPI dashboards</Bullet>
            </ul>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Bonuses included</div>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Gift className="size-4 text-amber-500"/> Agent onboarding kit (scripts, email/SMS templates)</li>
                  <li className="flex items-start gap-2"><Gift className="size-4 text-amber-500"/> Compliance-ready message review log</li>
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Guarantee</div>
                <p className="mt-2 text-sm text-zinc-200"><ShieldCheck className="inline size-4 text-amber-500 mr-1"/> Save 10+ hours/agent/month within 90 days or your subscription is free until you do.</p>
              </div>
            </div>
          </motion.div>

          {/* Who it's for / Not for */}
          <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="rounded-2xl border border-zinc-900">
            <div className="grid md:grid-cols-2">
              <div className="p-6 md:p-8 bg-zinc-900">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Who this is for</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Target className="size-4 text-amber-500"/> Agencies that want more held appointments</li>
                  <li className="flex items-start gap-2"><Target className="size-4 text-amber-500"/> Owners who value speed over perfection</li>
                  <li className="flex items-start gap-2"><Target className="size-4 text-amber-500"/> Teams willing to use follow‑up templates</li>
                </ul>
              </div>
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-zinc-900">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Not a fit for</div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2"><TicketCheck className="size-4 text-zinc-500"/> Those seeking a custom build before results</li>
                  <li className="flex items-start gap-2"><TicketCheck className="size-4 text-zinc-500"/> Teams unwilling to adopt simple playbooks</li>
                  <li className="flex items-start gap-2"><TicketCheck className="size-4 text-zinc-500"/> Anyone avoiding measurable KPIs</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT OVERVIEW (Feature tiles, concise) */}
      <section id="features" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">The product in 60 seconds</h2>
          <p className="mt-2 text-zinc-300 max-w-3xl">Leads, pipeline, recruiting, service, tasks, calendar, training, marketing, and analytics. All in one place.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Dashboard</div><p className="mt-2 text-sm text-zinc-300">KPIs, tasks, trends, activity feed, leaderboards.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Assistant</div><p className="mt-2 text-sm text-zinc-300">Create leads, draft emails, schedule, search knowledge.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Leads CRM</div><p className="mt-2 text-sm text-zinc-300">Client & recruit tabs, scoring, timeline, CSV import.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Pipeline</div><p className="mt-2 text-sm text-zinc-300">Drag‑and‑drop, values, filters, summaries.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Recruiting</div><p className="mt-2 text-sm text-zinc-300">Prospecting → retention with candidate cards.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Team</div><p className="mt-2 text-sm text-zinc-300">Rosters, KPIs, agent detail panels.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Automations</div><p className="mt-2 text-sm text-zinc-300">Workflows with guardrails and review logs.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Service Desk</div><p className="mt-2 text-sm text-zinc-300">Two‑pane tickets, notes, SLAs, CSAT.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Calendar</div><p className="mt-2 text-sm text-zinc-300">Month/Week/Day, quick create, Google sync.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Knowledge & Training</div><p className="mt-2 text-sm text-zinc-300">Searchable docs, onboarding tracks.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Email & SMS</div><p className="mt-2 text-sm text-zinc-300">Campaigns, unified inbox, performance.</p></div>
            <div className="rounded-xl border border-zinc-900 p-6 bg-zinc-900"><div className="text-sm uppercase tracking-wide text-zinc-400">Analytics</div><p className="mt-2 text-sm text-zinc-300">Funnel, revenue by line, leaderboard.</p></div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Proof & snapshots</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <div className="text-sm text-zinc-400">Agency Output</div>
              <div className="text-4xl font-black mt-1 text-white">+27%</div>
              <div className="text-xs text-zinc-500">within 60 days</div>
            </div>
            <div className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <div className="text-sm text-zinc-400">Time to Quote</div>
              <div className="text-4xl font-black mt-1 text-white">−32%</div>
              <div className="text-xs text-zinc-500">with automations</div>
            </div>
            <div className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <div className="text-sm text-zinc-400">Renewal Response</div>
              <div className="text-4xl font-black mt-1 text-white">+19%</div>
              <div className="text-xs text-zinc-500">within first quarter</div>
            </div>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <figure className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <blockquote className="text-sm text-zinc-300">"We finally stopped chasing spreadsheets. The follow‑ups go out, appointments hold, and reps can sell."</blockquote>
              <figcaption className="mt-3 text-xs text-zinc-500">Director, Regional P&C (12 agents)</figcaption>
            </figure>
            <figure className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <blockquote className="text-sm text-zinc-300">"Onboarding a rep took weeks. With templates and tracks, they're productive in days."</blockquote>
              <figcaption className="mt-3 text-xs text-zinc-500">Sales Manager, Life & Health</figcaption>
            </figure>
            <figure className="rounded-2xl border border-zinc-900 p-6 bg-zinc-900">
              <blockquote className="text-sm text-zinc-300">"Service tickets and email in one place = nothing falls through. Boring in the best way."</blockquote>
              <figcaption className="mt-3 text-xs text-zinc-500">Ops Lead, Independent agency</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* PRICING (conversion‑first) */}
      <section id="pricing" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Simple pricing</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <span className={!annual ? "font-semibold text-white" : "text-zinc-400"}>Monthly</span>
              <button onClick={() => setAnnual(!annual)} className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800" aria-label="Toggle billing">
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${annual ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={annual ? "font-semibold text-white" : "text-zinc-400"}>Annual <span className="ml-1 text-amber-500">(save 20%)</span></span>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                monthly: 129,
                annual: 99,
                tagline: "Solo agents or small teams",
                features: ["Core CRM & pipeline","Calendar + tasks","Email campaigns","Assistant (lite)"],
                cta: "Start pilot",
              },
              {
                name: "Growth",
                monthly: 349,
                annual: 279,
                tagline: "Automation for growing agencies",
                features: ["Everything in Starter","Workflows & automations","Service desk + CSAT","Assistant (full)"],
                cta: "Book a demo",
                highlight: true,
              },
              {
                name: "Scale",
                monthly: 799,
                annual: 649,
                tagline: "Advanced analytics & teams",
                features: ["Everything in Growth","Advanced analytics","Recruiting pipeline","SSO + audit logs"],
                cta: "Talk to sales",
              },
            ].map((tier, i) => (
              <motion.div key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className={`rounded-2xl border border-zinc-900 bg-zinc-900 p-6 ${tier.highlight ? "ring-2 ring-amber-500/40" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  {tier.highlight && <span className="text-[11px] px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-400">Most popular</span>}
                </div>
                <p className="text-sm text-zinc-300 mt-1">{tier.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${price(tier.monthly, tier.annual)}</span>
                  <span className="text-sm text-zinc-400">/user/mo</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {tier.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                      <CheckCircle2 className="mt-0.5 size-4 text-amber-500" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="#demo" className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold ${tier.highlight ? "bg-amber-500 text-black" : "border border-zinc-800 hover:bg-zinc-800"}`}>
                  {tier.cta} <ArrowRight className="size-5" />
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">Prices are examples. Final pricing depends on your agreements.</p>

          {/* DFY ACCELERATOR (Optional add-on to match Hormozi playbook) */}
          <div className="mt-12 rounded-2xl border border-zinc-900 bg-zinc-900 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-amber-400">Optional add‑on</div>
                <h3 className="text-xl font-black text-white">Guided Setup Accelerator</h3>
                <p className="text-sm text-zinc-300 mt-1">Live configuration workshops + training to hit the goal faster.</p>
              </div>
              <a href="#demo" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold bg-amber-500 text-black">See agenda <ArrowRight className="size-5"/></a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">How it works</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { title: "Align", desc: "Pick one outcome for the pilot and define success in numbers.", icon: Target },
              { title: "Implement", desc: "Configure CRM, pipeline, automations, assistant.", icon: Workflow },
              { title: "Scale", desc: "Train team, track KPIs, iterate until predictable.", icon: TrendingUp },
            ].map((s, i) => (
              <motion.div key={i} variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="rounded-2xl p-6 border border-zinc-900 bg-zinc-900">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <s.icon className="size-4"/> Step {i+1}
                </div>
                <h4 className="text-lg font-bold mt-2 text-white">{s.title}</h4>
                <p className="text-sm text-zinc-300 mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f, idx) => (
              <details key={idx} className="group rounded-xl border border-zinc-900 bg-zinc-900 p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-white">{f.q}</span>
                </summary>
                <p className="mt-2 text-sm text-zinc-300">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="demo" className="py-16 md:py-24 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Book a demo</h2>
          <p className="mt-2 text-zinc-300">Tell us about your agency and the outcome you want in the next 90 days.</p>
          <form className="mt-8 grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-300">Full name</label>
              <input className="mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-600" placeholder="Alex Morgan" />
            </div>
            <div>
              <label className="text-sm text-zinc-300">Work email</label>
              <input type="email" className="mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-600" placeholder="alex@agency.com" />
            </div>
            <div>
              <label className="text-sm text-zinc-300">Company</label>
              <input className="mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-600" placeholder="Peak Cover LLC" />
            </div>
            <div>
              <label className="text-sm text-zinc-300">Team size</label>
              <select className="mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-white">
                <option>1</option>
                <option>2–5</option>
                <option>6–15</option>
                <option>16–50</option>
                <option>50+</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-zinc-300">What outcome would make this a win in 90 days?</label>
              <textarea className="mt-1 w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-white placeholder:text-zinc-600" rows={4} placeholder="e.g., 20% more held appointments, 30% faster onboarding, shorter quote cycles" />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
              <button type="button" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-bold bg-amber-500 text-black">
                Submit request <ArrowRight className="size-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="size-4 text-amber-500" />
                <span>We'll never sell your data. Audit trail on all actions.</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* STICKY CTA */}
      <div className="sticky bottom-0 z-30 border-t border-zinc-900 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-zinc-300 flex items-center gap-2">
            <Flame className="size-4 text-amber-500"/> Pilot spots are limited this month
          </div>
          <a href="#offer" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-bold bg-amber-500 text-black">Start your 14‑day pilot <ArrowRight className="size-4"/></a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">© {new Date().getFullYear()} OptiSyn Solutions — InsurAgent Pro</div>
          <div className="flex items-center gap-3 text-sm">
            <a href="#offer" className="hover:text-white text-zinc-300">Offer</a>
            <a href="#features" className="hover:text-white text-zinc-300">Product</a>
            <a href="#pricing" className="hover:text-white text-zinc-300">Pricing</a>
            <a href="#faq" className="hover:text-white text-zinc-300">FAQ</a>
            <a href="#demo" className="hover:text-white text-zinc-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
