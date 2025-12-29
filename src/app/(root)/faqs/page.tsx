export default function FAQsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--pure-white)' }}>
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="inline-block px-8 py-4 rounded-full mb-6" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <span className="text-lg font-montserrat font-semibold uppercase tracking-wide text-gold-gradient">
              FAQs
            </span>
          </div>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-playfair-display font-bold mb-6 text-gold-gradient" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)' }}>
          Coming Soon
        </h1>
        <p className="text-xl sm:text-2xl font-montserrat max-w-2xl mx-auto" style={{ color: 'var(--primary-blue)' }}>
          We're preparing answers to your frequently asked questions. Check back soon!
        </p>
      </div>
    </div>
  );
}
