import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="font-heading font-bold text-6xl text-[#005B41] mb-4">404</div>
        <h1 className="font-heading font-bold text-2xl text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="bg-[#005B41] text-white font-medium px-6 py-2.5 rounded hover:bg-[#004A36] transition-colors text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
