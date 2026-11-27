import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <h1 className="font-display text-5xl text-navy">This page is not available.</h1>
      <Link href="/" className="mt-6 inline-block underline">Home</Link>
    </div>
  );
}
