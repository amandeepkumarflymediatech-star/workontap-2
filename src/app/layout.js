import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';
import db from '@/lib/db';
import { headers } from "next/headers";
import { Geist, Geist_Mono, Outfit } from "next/font/google";

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
  let pathname = headersList.get("x-pathname") || "/";

  if (!pathname || pathname === "" || pathname === "index") {
    pathname = "/";
  }

  let globalSeo = null;
  let pageSeo = null;
  let blogSeo = null;

  try {
    const rows = await db.query("SELECT * FROM seo_settings WHERE page_name = 'global' LIMIT 1");
    if (rows && rows.length > 0) globalSeo = rows[0];
  } catch (e) {}

  try {
    const rows = await db.query(`SELECT * FROM seo_settings WHERE page_name = ? LIMIT 1`, [pathname]);
    if (rows && rows.length > 0) pageSeo = rows[0];
  } catch (e) {}

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  if (pathname.includes("/blogs/") && lastSegment) {
    try {
      const rows = await db.query(`SELECT * FROM blogs WHERE slug = ? LIMIT 1`, [lastSegment]);
      if (rows && rows.length > 0) blogSeo = rows[0];
    } catch (e) {}
  }

  const finalTitle = blogSeo?.meta_title || blogSeo?.title || pageSeo?.meta_title || globalSeo?.meta_title || "WorkOnTap - Home Maintenance Services";
  const finalDesc = blogSeo?.meta_description || pageSeo?.meta_description || globalSeo?.meta_description || "Book trusted local pros for your home maintenance needs";
  const finalKeywords = blogSeo?.keywords || pageSeo?.keywords || globalSeo?.keywords || "home maintenance, plumbers, electricians, hvac, cleaners";
  const finalCanonical = blogSeo?.canonical_url || pageSeo?.canonical_url || globalSeo?.canonical_url || `https://workontap.com${pathname}`;
  const robotsValue = blogSeo?.meta_robots || pageSeo?.meta_robots || globalSeo?.meta_robots || "index, follow";
  
  let ogImage = blogSeo?.image_url || pageSeo?.og_image || globalSeo?.og_image || null;
  if (ogImage && ogImage.includes("localhost")) {
    ogImage = ogImage.replace("http://localhost:3000", "https://workontap.com");
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased font-sans flex flex-col min-h-screen`}>
      <head>
        <title>{finalTitle}</title>
        <meta name="description" content={finalDesc} />
        <meta name="keywords" content={finalKeywords} />
        <meta name="robots" content={robotsValue} />
        <meta name="googlebot" content={`${robotsValue}, max-video-preview:-1, max-image-preview:large, max-snippet:-1`} />
        <link rel="canonical" href={finalCanonical} />
        <meta name="google-site-verification" content="A6y8CvpEQ9Tkn0I6JPDykgUl9e2vRCmBYZiHON-QEcw" />

        <meta property="og:title" content={pageSeo?.og_title || finalTitle} />
        <meta property="og:description" content={pageSeo?.og_description || finalDesc} />
        <meta property="og:url" content={finalCanonical} />
        <meta property="og:site_name" content="WorkOnTap" />
        <meta property="og:type" content={pathname.includes("/blogs/") ? "article" : "website"} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageSeo?.og_title || finalTitle} />
        <meta name="twitter:description" content={pageSeo?.og_description || finalDesc} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        <link rel="icon" href="/favicon.png" />

        {globalSeo?.header_scripts && (
          <div dangerouslySetInnerHTML={{ __html: globalSeo.header_scripts }} className="hidden" />
        )}
        {pageSeo?.header_scripts && (
          <div dangerouslySetInnerHTML={{ __html: pageSeo.header_scripts }} className="hidden" />
        )}
      </head>

      <body className="flex-grow flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>

        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="afterInteractive" crossOrigin="anonymous" />
        <Script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" crossOrigin="anonymous" />
        
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />

        <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`} strategy="beforeInteractive" />

        {globalSeo?.footer_scripts && (
          <div dangerouslySetInnerHTML={{ __html: globalSeo.footer_scripts }} className="hidden" />
        )}
        {pageSeo?.footer_scripts && (
          <div dangerouslySetInnerHTML={{ __html: pageSeo.footer_scripts }} className="hidden" />
        )}
      </body>
    </html>
  );
}