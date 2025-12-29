import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const albertSans = localFont({
  src: "./fonts/AlbertSans.woff",
  variable: "--font-albert-sans",
  weight: "100 200 300 400 500 600 700 800 900",
});

export const metadata: Metadata = {
  title: "Memowries",
  description:
    "Elevate your living space with our Modern Luxe 3-Seater Sofa. Featuring plush cushions, sleek design, and durable construction, it’s the perfect blend of elegance and comfort. Ideal for any modern home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      layout: { 
        socialButtonsVariant: 'iconButton',
        logoImageUrl: '/assets/logo.png'
      },
      variables: {
        colorBackground: '#15171c',
        colorPrimary: '#DAAB2D',
        colorNeutral: 'white',
        colorText: 'white',
        colorInputBackground: '#1b1f29',
        colorInputText: 'white',
      }
    }}>
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${albertSans.variable} antialiased`}>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
