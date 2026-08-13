import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import { headers } from "next/headers";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { getSeoForPath } from "@/lib/seo";
import DynamicSeoManager from "@/components/DynamicSeoManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const rawPathname = headersList.get("x-pathname") || "/";

  const seo = await getSeoForPath(rawPathname);

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}>
      <head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content={seo.robots} />
        <meta name="googlebot" content={`${seo.robots}, max-video-preview:-1, max-image-preview:large, max-snippet:-1`} />
        <link rel="canonical" href={seo.canonical} />
        <meta name="google-site-verification" content="A6y8CvpEQ9Tkn0I6JPDykgUl9e2vRCmBYZiHON-QEcw" />

        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.ogDescription} />
        <meta property="og:url" content={seo.canonical} />
        <meta property="og:site_name" content="WorkOnTap" />
        <meta property="og:type" content={rawPathname.includes("/blogs/") ? "article" : "website"} />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.ogTitle} />
        <meta name="twitter:description" content={seo.ogDescription} />
        {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

        <link rel="icon" href="/favicon.png" />

        {seo.headerScripts && (
          <div dangerouslySetInnerHTML={{ __html: seo.headerScripts }} className="hidden" />
        )}
      </head>

      <body className="flex-grow flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <DynamicSeoManager />
          {children}
          <Toaster position="top-right" />
        </AuthProvider>

        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="afterInteractive" crossOrigin="anonymous" />
        <Script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" crossOrigin="anonymous" />
        
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />

        <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`} strategy="beforeInteractive" />

        {seo.footerScripts && (
          <div dangerouslySetInnerHTML={{ __html: seo.footerScripts }} className="hidden" />
        )}
      </body>
    </html>
  );
}