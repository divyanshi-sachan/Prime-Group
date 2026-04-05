import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond } from "next/font/google";
import "@/styles/globals.css";
import { getSiteUrl } from "@/lib/site";
import { AuthCrossTabSync } from "@/components/providers/auth-cross-tab-sync";

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

const harveySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-harvey-serif",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/img/home.png",
    shortcut: "/img/home.png",
    apple: "/img/home.png",
  },
  title: {
    default: "Prime Group Matrimony | Find Your Perfect Life Partner",
    template: "%s | Prime Group Matrimony",
  },
  description:
    "Find your perfect life partner with Prime Group Matrimony. Connect with verified profiles, browse quality matches, and discover meaningful relationships in a secure, privacy-focused platform.",
  keywords: [
    "matrimonial",
    "marriage",
    "bride",
    "groom",
    "matrimony",
    "life partner",
    "wedding",
    "marriage bureau",
    "verified profiles",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Prime Group Matrimony",
    title: "Prime Group Matrimony | Find Your Perfect Life Partner",
    description:
      "Find your perfect life partner with Prime Group. Connect with verified profiles and discover meaningful relationships.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Group Matrimony | Find Your Perfect Life Partner",
    description:
      "Find your perfect life partner with Prime Group. Connect with verified profiles and discover meaningful relationships.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Prime Group Matrimony",
        url: siteUrl,
        description:
          "Prime Group Matrimony is a trusted matrimonial platform for finding your perfect life partner through verified profiles and privacy-focused design.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Prime Group Matrimony",
        description:
          "Find your perfect life partner with Prime Group Matrimony. Connect with verified profiles and discover meaningful relationships.",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-IN",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${albertSans.variable} ${harveySerif.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthCrossTabSync />
        {children}
      </body>
    </html>
  );
}
