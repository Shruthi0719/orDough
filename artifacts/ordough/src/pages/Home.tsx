import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  getListReviewsQueryKey,
  useCreateReview,
  useListMenuItems,
  useListReviews,
  type MenuItem,
  type Review,
} from "@workspace/api-client-react";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const ThreeHero = lazy(() => import("@/components/ThreeHero"));

const fallbackMenuItems: MenuItem[] = [
  {
    id: "sample-dark-choco-cookie",
    name: "Dark Choco Cookie",
    emoji: "🍪",
    category: "Cookies",
    price: 120,
    cost: 45,
    description: "Espresso cocoa, brown butter, and a soft molten center.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-blueberry-cupcake",
    name: "Blueberry Cloud Cupcake",
    emoji: "🧁",
    category: "Cupcakes",
    price: 150,
    cost: 58,
    description: "Glacier-blue frosting, vanilla crumb, and berry jam.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-fudge-brownie",
    name: "Fudge Brownie",
    emoji: "🍫",
    category: "Brownies",
    price: 140,
    cost: 52,
    description: "Dense, glossy chocolate with a roasted espresso edge.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-cinnamon-roll",
    name: "Cinnamon Swirl",
    emoji: "🥐",
    category: "Pastry",
    price: 165,
    cost: 62,
    description: "Slow-proofed dough, cinnamon sugar, and bisque glaze.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-doughnut",
    name: "Chambray Doughnut",
    emoji: "🍩",
    category: "Doughnuts",
    price: 135,
    cost: 48,
    description: "Blue vanilla icing, soft dough, and palette sprinkles.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-cookie-box",
    name: "Mini Cookie Box",
    emoji: "🎁",
    category: "Boxes",
    price: 420,
    cost: 170,
    description: "A six-piece box for gifting, sharing, or not sharing.",
    available: true,
    createdAt: new Date(0).toISOString(),
  },
];

const fallbackReviews: Review[] = [
  {
    id: "sample-review-a",
    customerName: "Ananya",
    rating: 5,
    comment: "The blueberry cupcake was dreamy, balanced, and so pretty.",
    product: "Blueberry Cloud Cupcake",
    approved: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-review-b",
    customerName: "Riya",
    rating: 5,
    comment: "Best brownie I have ordered locally. Rich without being too sweet.",
    product: "Fudge Brownie",
    approved: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "sample-review-c",
    customerName: "Ishaan",
    rating: 4,
    comment: "The cookies arrived warm and the packaging looked premium.",
    product: "Dark Choco Cookie",
    approved: true,
    createdAt: new Date(0).toISOString(),
  },
];

function buildOrderUrl(itemName: string) {
  const message = `Hi orDough, I want to order ${itemName}.`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// Typewriter hook
function useTypewriter(text: string, speed = 60, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// Floating particle
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", background: "rgba(250,246,241,0.25)", ...style }}
      animate={{ y: [0, -80, 0], opacity: [0.2, 0.7, 0.2] }}
      transition={{
        duration: (style as any)["--dur"] ?? 5,
        delay: (style as any)["--delay"] ?? 0,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function HeroBackground() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const particles = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      width: Math.random() * 5 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dur: 4 + Math.random() * 5,
      delay: Math.random() * 4,
    }))
  );

  useEffect(() => { setWebgl(hasWebGL()); }, []);
  if (webgl === null) return null;

  return (
    <div className="absolute inset-0">
      {!webgl ? (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 60% 40%, #3A2119 0%, #0a0402 60%), radial-gradient(ellipse at 20% 80%, #3A2119 0%, #0a0402 50%)"
        }}>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, rgba(210,105,30,0.25) 0%, transparent 55%), radial-gradient(circle at 75% 20%, rgba(121,163,195,0.15) 0%, transparent 45%)"
          }} />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-95">
          <Suspense fallback={
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, #3A2119 0%, #0a0402 70%)" }} />
          }>
            <ThreeHero />
          </Suspense>
        </div>
      )}
      {/* Floating flour dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.current.map((p, i) => (
          <Particle
            key={i}
            style={{
              width: p.width,
              height: p.width,
              left: p.left,
              top: p.top,
              "--dur": p.dur,
              "--delay": p.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: menuItems } = useListMenuItems();
  const { data: reviews } = useListReviews();
  const createReview = useCreateReview();
  const queryClient = useQueryClient();
  const { displayed, done } = useTypewriter("baked with love", 65, 500);
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    product: "",
    rating: 5,
    comment: "",
  });
  const [reviewMessage, setReviewMessage] = useState("");

  const featuredItems = Array.isArray(menuItems) ? menuItems.filter(i => i.available).slice(0, 6) : [];
  const approvedReviews = Array.isArray(reviews) ? reviews.filter(r => r.approved).slice(0, 8) : [];
  const displayMenuItems = featuredItems.length > 0 ? featuredItems : fallbackMenuItems;
  const displayReviews = approvedReviews.length > 0 ? approvedReviews : fallbackReviews;

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewMessage("");
    try {
      await createReview.mutateAsync({
        data: {
          customerName: reviewForm.customerName.trim(),
          product: reviewForm.product.trim() || null,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          approved: false,
        },
      });
      setReviewForm({ customerName: "", product: "", rating: 5, comment: "" });
      setReviewMessage("Thank you. Your review will appear after approval.");
      queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
    } catch {
      setReviewMessage("Could not send that review yet. Please try again.");
    }
  };

  return (
    <PublicLayout>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
        .cursor-blink {
          display: inline-block;
          width: 3px;
          height: 0.85em;
          background: #EBCDB7;
          margin-left: 4px;
          vertical-align: middle;
          animation: blink 0.9s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .menu-card:hover { transform: translateY(-10px); box-shadow: 0 20px 60px rgba(121,163,195,0.18), 0 0 0 1px rgba(121,163,195,0.3); }
        .menu-card { transition: transform 0.4s cubic-bezier(.22,.68,0,1.2), box-shadow 0.4s ease; }
        .menu-card:hover .menu-emoji { transform: scale(1.15); }
        .menu-emoji { transition: transform 0.4s ease; display: inline-block; }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative min-h-[92dvh] w-full flex items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 text-center pointer-events-none px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6"
          >
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, delay: 1.5, repeat: 1 }}
              className="text-xs uppercase tracking-[0.5em] font-sans"
              style={{ color: "rgba(235,205,183,0.55)" }}
            >
              orDough Bakery
            </motion.span>
          </motion.div>

          {/* Typewriter headline */}
          <h1
            className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight mb-6 text-white"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, minHeight: "1.2em" }}
          >
            {displayed}
            {!done && <span className="cursor-blink" />}
          </h1>

          {/* Tagline fades in after typing */}
          <AnimatePresence>
            {done && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-xl md:text-2xl italic text-[#EBCDB7]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                one more?
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="mt-16 pointer-events-auto"
          >
            <a
              href="#menu"
              className="inline-block border border-white/30 px-10 py-4 uppercase tracking-widest text-sm hover:bg-white hover:text-[#0a0402] transition-all duration-500"
            >
              Explore Menu
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-white/30">Scroll</span>
            <motion.div
              className="w-px bg-white/20"
              animate={{ height: [16, 32, 16] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Menu Section ── */}
      <section id="menu" className="py-20 px-6 md:px-12 bg-[#0a0402]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6"
          >
            <div>
              <h2
                className="text-4xl md:text-5xl mb-4 text-white"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
              >
                Our Craft
              </h2>
              <p className="text-white/50 max-w-md">Baked fresh daily in small batches. When they're gone, they're gone.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayMenuItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
                className="menu-card group relative bg-[#0a0402] border border-white/5 p-8"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-4xl menu-emoji">{item.emoji}</span>
                  <span className="text-xs uppercase tracking-widest text-white/40 border border-white/10 px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                <h3
                  className="text-2xl mb-2 group-hover:text-[#EBCDB7] transition-colors text-white"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {item.name}
                </h3>
                <p className="text-white/50 text-sm mb-6 min-h-[40px]">{item.description}</p>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span
                    className="text-xl text-[#79A3C3]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                  >
                    ₹{Number(item.price).toFixed(0)}
                  </span>
                  <a
                    href={buildOrderUrl(item.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-widest text-white/40 hover:text-[#79A3C3] transition-colors"
                  >
                    Order +
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="py-20 px-6 md:px-12 overflow-hidden border-y border-white/5 bg-[#0a0402]">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="min-w-0"
          >
            <div className="mb-8">
              <h2
                className="text-4xl md:text-5xl mb-4 text-white"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
              >
                Reviews
              </h2>
              <p className="text-white/50 max-w-md">Small-batch sweetness, big feelings.</p>
            </div>

            <div className="flex space-x-6 animate-marquee whitespace-nowrap">
              {[...displayReviews, ...displayReviews].map((review, i) => (
                <div
                  key={`${review.id}-${i}`}
                  className="inline-block w-80 lg:w-96 bg-[#0a0402] border border-white/5 p-8 shrink-0 hover:border-[#79A3C3]/40 transition-colors duration-300"
                >
                  <div className="flex gap-1 mb-4 text-[#79A3C3]">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p
                    className="text-white/80 italic text-lg mb-6 break-words whitespace-normal leading-relaxed"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#79A3C3]/15 flex items-center justify-center text-xs text-[#D2E2EC]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{review.customerName}</p>
                      <p className="text-xs text-white/40">{review.product ?? "Customer"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleReviewSubmit}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
            className="border border-white/10 bg-white/[0.03] p-6 lg:sticky lg:top-28"
          >
            <h3
              className="text-3xl mb-5 text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
            >
              Add a review
            </h3>
            <div className="space-y-4">
              <input
                value={reviewForm.customerName}
                onChange={(event) => setReviewForm((form) => ({ ...form, customerName: event.target.value }))}
                required
                minLength={2}
                placeholder="Your name"
                className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#79A3C3]"
              />
              <input
                value={reviewForm.product}
                onChange={(event) => setReviewForm((form) => ({ ...form, product: event.target.value }))}
                placeholder="What did you try?"
                className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#79A3C3]"
              />
              <select
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((form) => ({ ...form, rating: Number(event.target.value) }))}
                className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#79A3C3]"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating} className="bg-[#0a0402] text-white">
                    {rating} star{rating === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((form) => ({ ...form, comment: event.target.value }))}
                required
                minLength={8}
                rows={4}
                placeholder="Tell us what you loved"
                className="w-full resize-none border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#79A3C3]"
              />
              {reviewMessage && <p className="text-sm text-[#D2E2EC]">{reviewMessage}</p>}
              <button
                type="submit"
                disabled={createReview.isPending}
                className="w-full bg-[#79A3C3] px-5 py-3 text-sm font-semibold uppercase tracking-widest text-[#0a0402] transition-colors hover:bg-[#D2E2EC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createReview.isPending ? "Sending..." : "Submit Review"}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24 px-6 md:px-12 bg-[#0a0402]">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden"
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #3A2119 0%, #3A2119 40%, #0a0402 100%)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-8xl mb-6">🍪</div>
                <div
                  className="text-2xl text-[#EBCDB7] italic"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Since 2021
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <h2
              className="text-4xl md:text-5xl mb-8 text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
            >
              The dark side of dough.
            </h2>
            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                We started orDough with a simple premise: pastry shouldn't just be sweet. It should be an experience. Deeply roasted, perfectly caramelized, resting right on the edge of burnt.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Every morning before the sun rises, our ovens hit 500 degrees. We use high-extraction flours, wild yeast cultures, and French butter. No shortcuts. No compromises.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-xl text-[#EBCDB7] italic"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                "Just one more..."
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
