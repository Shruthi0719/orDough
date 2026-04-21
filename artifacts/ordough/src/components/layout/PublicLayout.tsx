import { Link } from "wouter";
import { useEffect, useState } from "react";
import { CustomCursor } from "@/components/ui/CustomCursor";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0402] text-white selection:bg-[#79A3C3] selection:text-white font-sans flex flex-col">
      <CustomCursor />
      
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent ${
          scrolled ? "bg-[#0a0402]/80 backdrop-blur-md border-white/10 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl tracking-wide flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span>🍪</span> orDough
          </Link>
          <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-white/70">
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link href="/admin" className="hover:text-[#79A3C3] transition-colors font-medium">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#0a0402] pt-20 pb-10">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <Link href="/" className="font-serif text-3xl mb-4 block">🍪 orDough</Link>
            <p className="text-[#79A3C3] font-serif italic text-xl">one more?</p>
          </div>
          <div>
            <h4 className="text-white/50 uppercase tracking-widest text-xs mb-6">Visit Us</h4>
            <address className="not-italic text-white/80 space-y-2 text-sm">
              <p>123 Artisan Lane</p>
              <p>Paris, France 75001</p>
              <p className="pt-4">Wed - Sun: 8am - 4pm</p>
            </address>
          </div>
          <div>
            <h4 className="text-white/50 uppercase tracking-widest text-xs mb-6">Contact</h4>
            <div className="space-y-4">
              <a
                href="https://wa.me/?text=Hi%20orDough%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#79A3C3] group-hover:bg-[#79A3C3]/10">WA</span>
                WhatsApp Us
              </a>
              <a
                href="upi://pay?pa=ordough@ybl&pn=orDough&cu=INR"
                className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#EBCDB7] group-hover:bg-[#EBCDB7]/10">UPI</span>
                Pay with UPI
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 md:px-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} orDough Bakery. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
