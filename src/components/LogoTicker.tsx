"use client";

const SERVICES = [
  "Google",
  "GitHub",
  "LinkedIn",
  "Dropbox",
  "Microsoft",
  "Apple",
  "Facebook",
  "Instagram",
  "X",
  "Spotify",
  "TikTok",
  "Netflix",
  "Adobe",
  "Notion",
  "Slack",
  "Discord",
  "Reddit",
  "Zoom",
  "PayPal",
  "eBay",
  "Amazon",
  "Uber",
  "Airbnb",
  "Pinterest",
  "Snapchat",
  "Twitch",
  "Yahoo",
  "ProtonMail",
  "GitLab",
  "Bitbucket",
  "LastPass",
  "1Password",
  "Salesforce",
  "Atlassian",
  "HubSpot",
  "Shopify",
  "Stripe",
  "Venmo",
  "CashApp",
  "DoorDash",
  "Duolingo",
  "Strava",
  "FitBit",
  "UberEats",
  "Etsy",
  "Vimeo",
  "WordPress",
  "Medium",
  "Quora",
  "Khan Academy",
  "Coursera",
  "Walmart",
  "Target",
  "Samsung",
  "Sony",
];

function Badge({ name }: { name: string }) {
  const letter = name[0];
  // Deterministic hue from name
  const hue =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div className="logo-fallback shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
        style={{
          background: `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${
            (hue + 40) % 360
          },70%,35%))`,
          color: "white",
        }}
      >
        {letter}
      </div>
      <span className="text-xs text-[var(--muted)] whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function LogoTicker() {
  const doubled = [...SERVICES, ...SERVICES];
  return (
    <div className="logo-ticker relative overflow-hidden py-2">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent z-10" />
      <div className="flex gap-3 marquee-track w-max">
        {doubled.map((s, i) => (
          <Badge key={i} name={s} />
        ))}
      </div>
    </div>
  );
}
