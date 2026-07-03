export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="bg-[#1a0a00] text-[#f4e7c8]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="text-lg font-bold tracking-wide text-[#ffc60a]">RETROH</div>
          <div className="text-sm opacity-70">Dashboard</div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-64 bg-gray-200 rounded-full" />
          <div className="h-64 bg-gray-100 border border-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
