// Canonical Good Thoughts footer — same on every section (finance, markets, IPO,
// blog, monitor, landing, info pages). Hand-copied into each app (same pattern as
// GoodThoughtsShell.jsx); keep copies in sync by diffing against this file.
//
// Every link is a plain <a>, not a router <Link>: these are apex-level static
// routes (served by goodthoughts-info-stage / the section containers) that exist
// outside any single app's client-side router, so a framework Link would 404 on
// first load in some of these apps. Do not add app-specific nav links here —
// that belongs in each app's own in-page navigation, not this shared footer.

const SECTIONS = [
  { label: 'Finance', href: '/' },
  { label: 'Markets', href: '/markets' },
  { label: 'IPO', href: '/ipo' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Monitor', href: '/monitor' },
];

const LEGAL = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Payment Policy', href: '/payment-policy' },
];

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: '1px solid rgba(0,69,50,0.12)', background: '#f6fdf9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#004532', fontFamily: 'Lora, serif' }}>Good Thoughts</div>
            <p style={{ fontSize: 13, color: '#5b6b63', marginTop: 8, lineHeight: 1.6 }}>
              Market data, IPOs, monitoring and editorial content for research — not investment advice.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5b6b63', marginBottom: 10 }}>Sections</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SECTIONS.map((s) => (
                <a key={s.href} href={s.href} style={{ fontSize: 13, color: '#374b41', textDecoration: 'none' }}>{s.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5b6b63', marginBottom: 10 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEGAL.map((l) => (
                <a key={l.href} href={l.href} style={{ fontSize: 13, color: '#374b41', textDecoration: 'none' }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid rgba(0,69,50,0.08)', fontSize: 12, color: '#8a9a91' }}>
          © {year} Good Thoughts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
