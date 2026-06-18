'use client'

/**
 * GoodThoughtsShell — the shared top product nav for every Good Thoughts section.
 *
 * Canonical source. Vendored into each React app for now (finance + markets + blog
 * + ipo); becomes the published `@goodthoughts/shell` once a GitHub Packages token
 * with `write:packages` exists.
 *
 * IMPORTANT: styled with STANDARD Tailwind classes + arbitrary hex values and a
 * couple of inline styles — NO dependency on any host app's design tokens — so it
 * renders identically whether the host is finance (Tailwind v4 @theme), markets
 * (shadcn tokens), blog/ipo (Tailwind v3), or a plain-CSS app. Colors are the
 * "Digital Curator" palette (primary #004532, primary-container #065f46).
 *
 * Identity: all sections are served from one origin (stage.goodthoughts.in) under
 * path prefixes, so the Supabase session that the /auth page stores in localStorage
 * (key `gt-auth`) is readable here too. The shell reads it directly (no supabase-js
 * dependency) to show the signed-in account + Logout; otherwise it shows Sign in.
 * Pass an explicit `user` prop to override (e.g. SSR-provided identity).
 *
 * Cross-section links are real anchors (<a href>), NOT client-side router links:
 * each section is a separate app/container behind Traefik, so moving between them
 * is a full document load by design.
 *
 * Props:
 *   current   — 'finance' | 'markets' | 'ipo' | 'blog' | 'monitor'
 *   user      — optional { name, email }; if omitted, read from the gt-auth session
 *   onSignIn  — optional handler; otherwise the slot links to /auth
 */

import { useState, useEffect } from 'react'

const SECTIONS = [
  { key: 'finance', label: 'Finance', href: '/' },
  { key: 'markets', label: 'Markets', href: '/markets' },
  { key: 'ipo', label: 'IPO', href: '/ipo/' },
  { key: 'blog', label: 'Blog', href: '/blog/' },
  { key: 'monitor', label: 'Monitor', href: '/monitor/' },
]

const SERIF = { fontFamily: "var(--font-lora), 'Lora', Georgia, 'Times New Roman', serif" }
const PRIMARY = '#004532'
const PRIMARY_CONTAINER = '#065f46'
const ON_SURFACE_VARIANT = '#2a3346'
const AUTH_STORAGE_KEY = 'gt-auth'

function initials(name) {
  if (!name) return null
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

// Read the Supabase session the /auth page persisted in localStorage. Dependency-
// free + tolerant of supabase-js v1 ({currentSession}) and v2 (session) shapes.
function readSessionUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const u = parsed?.user || parsed?.currentSession?.user || parsed?.session?.user
    if (!u?.email) return null
    const meta = u.user_metadata || {}
    return { email: u.email, name: meta.full_name || meta.name || null }
  } catch {
    return null
  }
}

function signOut() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch { /* ignore */ }
  window.location.reload()
}

// --- Shared market ticker: ONE managed source for every section --------------
// Same-origin fetch of the Finance market feed (/api/v1/market/ticker, reachable
// from any path on the unified host). Dependency-free (no react-query, no host
// CSS) so it renders identically in finance, markets, ipo, blog and the plain
// shell. Rendered just below the nav => always sits ABOVE each section sub-nav.
function GTTickerItem({ it }) {
  const pos = (it.change_percent ?? 0) >= 0
  const price = it.price != null ? Number(it.price).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '-'
  const pct = it.change_percent != null ? `${it.change_percent > 0 ? '+' : ''}${Number(it.change_percent).toFixed(2)}%` : ''
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', whiteSpace: 'nowrap' }}>
      <span style={{ color: '#9fb4ab', fontWeight: 500, fontSize: 12 }}>{(it.symbol && it.symbol.startsWith('^')) ? it.name : it.symbol}</span>
      <span style={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{price}</span>
      {pct ? <span style={{ color: pos ? '#34d399' : '#f87171', fontWeight: 500, fontSize: 12 }}>{pos ? '▲' : '▼'} {pct}</span> : null}
    </span>
  )
}

function gtMarketOpen() {
  const now = new Date()
  const ist = now.getUTCHours() * 60 + now.getUTCMinutes() + 330
  const day = (now.getUTCDay() + Math.floor(ist / 1440)) % 7
  const m = ((ist % 1440) + 1440) % 1440
  if (day === 0 || day === 6) return false
  return m >= 555 && m <= 930
}

function ProductTicker() {
  const [items, setItems] = useState([])
  useEffect(() => {
    let alive = true
    const load = () => fetch('/api/v1/market/ticker')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setItems([...(d.indices || []), ...(d.stocks || [])]) })
      .catch(() => {})
    load()
    const id = setInterval(load, 10000)
    return () => { alive = false; clearInterval(id) }
  }, [])
  if (!items.length) return null
  const doubled = [...items, ...items]
  const live = gtMarketOpen()
  const dur = Math.max(30, items.length * 3.5)
  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: 32, background: '#022a20', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <style>{`@keyframes gtTickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: '#022a20', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: live ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#cbd5d3' }}>{live ? 'LIVE' : 'CLOSED'}</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', height: '100%', width: 'max-content', animation: `gtTickerScroll ${dur}s linear infinite` }}>
        {doubled.map((it, i) => <GTTickerItem key={`${it.symbol}-${i}`} it={it} />)}
      </div>
    </div>
  )
}

export default function GoodThoughtsShell({ current = 'finance', user = null, onSignIn }) {
  // Start with the prop (or null) so server and first client render match (avoids
  // hydration mismatch); fill in the session-derived account after mount.
  const [acct, setAcct] = useState(user)
  useEffect(() => {
    if (user) { setAcct(user); return }
    setAcct(readSessionUser())
  }, [user])

  const label = acct ? (acct.name || acct.email) : null

  return (
    <nav className="w-full z-50 bg-emerald-50/80 backdrop-blur-md shadow-sm shadow-emerald-900/5">
      <div className="flex justify-between items-center gap-6 px-6 md:px-8 py-3 max-w-[1400px] mx-auto">
        {/* Brand */}
        <a href="/" className="shrink-0 text-xl md:text-2xl font-bold tracking-tight" style={{ ...SERIF, color: PRIMARY }}>
          Good Thoughts
        </a>

        {/* Section links */}
        <div className="hidden md:flex items-center gap-7">
          {SECTIONS.map((s) => {
            const active = s.key === current
            return (
              <a
                key={s.key}
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className="text-xs tracking-wider uppercase transition-colors pb-0.5"
                style={
                  active
                    ? { color: PRIMARY, fontWeight: 700, borderBottom: `2px solid ${PRIMARY}` }
                    : { color: ON_SURFACE_VARIANT, fontWeight: 500 }
                }
              >
                {s.label}
              </a>
            )
          })}
        </div>

        {/* Identity slot */}
        <div className="flex items-center gap-3 shrink-0">
          {acct ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:block text-sm font-medium" style={{ color: '#131b2e' }}>
                {label}
              </span>
              <div
                className="w-9 h-9 rounded-full grid place-items-center text-xs font-bold text-white"
                style={{ backgroundColor: PRIMARY }}
                title={acct.email}
              >
                {initials(acct.name) || (acct.email ? acct.email[0].toUpperCase() : 'GT')}
              </div>
              <button
                onClick={signOut}
                className="text-xs tracking-wider uppercase font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-100/60"
                style={{ color: ON_SURFACE_VARIANT }}
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href="/auth"
              onClick={onSignIn ? (e) => { e.preventDefault(); onSignIn(e) } : undefined}
              className="text-sm tracking-wider uppercase font-bold transition-opacity px-4 py-2.5 rounded-lg text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Sign in
            </a>
          )}
        </div>
      </div>
      <ProductTicker />
    </nav>
  )
}
