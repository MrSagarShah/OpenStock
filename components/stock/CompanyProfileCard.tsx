import { getCompanyProfile } from '@/lib/actions/finnhub.actions';

function fmtMarketCap(v?: number) {
    if (!v) return '—';
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}T`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(2)}B`;
    return `${v.toFixed(2)}M`;
}

export default async function CompanyProfileCard({ symbol }: { symbol: string }) {
    const profile = await getCompanyProfile(symbol);
    if (!profile) {
        return (
            <div className="rounded-xl border border-black/10 bg-white/70 p-5 text-sm text-gray-400 backdrop-blur-md">
                Company profile unavailable.
            </div>
        );
    }

    const rows: [string, string][] = [
        ['Country', profile.country ?? '—'],
        ['Exchange', profile.exchange ?? '—'],
        ['Industry', profile.finnhubIndustry ?? '—'],
        ['IPO Date', profile.ipo ?? '—'],
        ['Market Cap', fmtMarketCap(profile.marketCapitalization)],
        ['Shares Outstanding', profile.shareOutstanding ? `${profile.shareOutstanding.toFixed(2)}M` : '—'],
    ];

    return (
        <div className="rounded-xl border border-black/10 bg-white/70 p-5 backdrop-blur-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-100">Company Profile</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {rows.map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                        <dt className="text-gray-400">{k}</dt>
                        <dd className="text-gray-100">{v}</dd>
                    </div>
                ))}
            </dl>
            {profile.weburl && (
                <a
                    href={profile.weburl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm text-[#059669] hover:underline"
                >
                    {profile.weburl}
                </a>
            )}
        </div>
    );
}
