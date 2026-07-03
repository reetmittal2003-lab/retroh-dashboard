export default function StatusBanner({ live }: { live: boolean }) {
  if (live) {
    return (
      <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-200 w-fit">
        Connected to Netlify Forms
      </div>
    );
  }
  return (
    <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 w-fit">
      Showing sample data — add NETLIFY_ACCESS_TOKEN and NETLIFY_SITE_ID to .env.local to go live
    </div>
  );
}
