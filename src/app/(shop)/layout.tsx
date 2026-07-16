import { Playfair_Display, Cormorant_Garamond, Inter, Poppins } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartProvider } from "@/components/providers/cart-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${poppins.variable}`}>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <PageTransition>
            <main className="flex-1">{children}</main>
          </PageTransition>
          <Footer />
          <MobileNav />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}