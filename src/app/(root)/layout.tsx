import "@/styles/globals.css";
import MainNav from "@/components/navbar/main-nav";
import Footer from "@/components/footer/footer";
import ScrollProgress from "@/components/ui/scroll-progress";
import { FavoritesProvider } from "@/context/favorites-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FavoritesProvider>
        <MainNav />
        {children}
        <Footer />
     </FavoritesProvider>
  );
}
