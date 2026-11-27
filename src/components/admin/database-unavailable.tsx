export function DatabaseUnavailable() {
  return (
    <section className="rounded-md border border-[#e2d9cc] bg-white p-6">
      <h2 className="font-display text-xl text-[#1c2b3a]">The database is not available</h2>
      <p className="mt-2 max-w-xl text-sm text-[#4a5568]">This page could not read the database. No records are being substituted.</p>
    </section>
  )
}
