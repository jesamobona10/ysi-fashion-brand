import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <span className="font-display text-[10rem] leading-none text-jet/5 select-none">404</span>
        <h1 className="font-display text-4xl text-jet mt-[-1.5rem]">Page not found</h1>
        <p className="text-sm text-jet/50 font-poppins mt-4 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 gold-divider max-w-[60px] mx-auto" />
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 h-11 px-6 bg-jet text-cream text-[10px] font-poppins uppercase tracking-luxe hover:bg-gold hover:text-jet transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
