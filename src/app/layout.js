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
  let rawPathname = headersList.get("x-pathname") || "/";

  // Normalize pathname
  let pathname = rawPathname.trim();
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  if (!pathname || pathname === "" || pathname === "index") {
    pathname = "/";
  }

  let globalSeo = null;
  let pageSeo = null;
  let blogSeo = null;
  let serviceSeo = null;

  // 1. Fetch Global SEO
  try {
    const rows = await db.query("SELECT * FROM seo_settings WHERE LOWER(page_name) = 'global' LIMIT 1");
    if (rows && rows.length > 0) globalSeo = rows[0];
  } catch (e) {}

  // Build variations of page_name to match DB records flexible formats (e.g. '/about', 'about', 'home', '/', etc.)
  const cleanName = pathname.replace(/^\//, '');
  const pageVariants = [
    pathname,
    cleanName,
    pathname.toLowerCase(),
    cleanName.toLowerCase()
  ];
  if (pathname === '/') {
    pageVariants.push('home', 'index', '');
  }

  // 2. Fetch Page SEO from seo_settings
  try {
    const rows = await db.query(
      `SELECT * FROM seo_settings WHERE LOWER(page_name) IN (?) LIMIT 1`,
      [pageVariants]
    );
    if (rows && rows.length > 0) pageSeo = rows[0];
  } catch (e) {}

  const lastSegment = pathname.split("/").filter(Boolean).pop();

  // 3. Fetch Blog SEO if visiting a blog detail page (/blogs/:id_or_slug)
  if (pathname.includes("/blogs/") && lastSegment && lastSegment !== "blogs") {
    try {
      const rows = await db.query(
        `SELECT * FROM blogs WHERE (slug = ? OR id = ?) AND is_published = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      );
      if (rows && rows.length > 0) blogSeo = rows[0];
    } catch (e) {}
  }

  // 4. Fetch Service SEO if visiting a service detail page (/services/:id_or_slug)
  if (pathname.includes("/services/") && lastSegment && lastSegment !== "services") {
    try {
      const rows = await db.query(
        `SELECT * FROM services WHERE (slug = ? OR id = ?) AND is_active = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      );
      if (rows && rows.length > 0) serviceSeo = rows[0];
    } catch (e) {}
  }

  // Resolve final meta fields using hierarchy: Blog / Service -> Specific Page -> Global -> Defaults
  const finalTitle = 
    blogSeo?.meta_title || 
    blogSeo?.title || 
    (serviceSeo ? `${serviceSeo.name} | WorkOnTap` : null) || 
    pageSeo?.meta_title || 
    globalSeo?.meta_title || 
    "WorkOnTap - Home Maintenance Services";

  const rawServiceDesc = serviceSeo?.short_description || serviceSeo?.description || null;
  const cleanServiceDesc = rawServiceDesc ? rawServiceDesc.replace(/<[^>]*>?/gm, '').slice(0, 160) : null;

  const finalDesc = 
    blogSeo?.meta_description || 
    cleanServiceDesc || 
    pageSeo?.meta_description || 
    globalSeo?.meta_description || 
    "Book trusted local pros for your home maintenance needs";

  const finalKeywords = 
    blogSeo?.keywords || 
    (serviceSeo ? `${serviceSeo.name}, home service, workontap` : null) || 
    pageSeo?.keywords || 
    globalSeo?.keywords || 
    "home maintenance, plumbers, electricians, hvac, cleaners";

  const finalCanonical = 
    blogSeo?.canonical_url || 
    pageSeo?.canonical_url || 
    globalSeo?.canonical_url || 
    `https://workontap.com${pathname}`;

  const robotsValue = 
    blogSeo?.meta_robots || 
    pageSeo?.meta_robots || 
    globalSeo?.meta_robots || 
    "index, follow";

  const ogTitle = 
    blogSeo?.og_title || 
    pageSeo?.og_title || 
    finalTitle;

  const ogDesc = 
    blogSeo?.og_description || 
    pageSeo?.og_description || 
    finalDesc;

  let ogImage = 
    blogSeo?.og_image || 
    blogSeo?.image_url || 
    serviceSeo?.image_url || 
    pageSeo?.og_image || 
    globalSeo?.og_image || 
    null;

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

        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:url" content={finalCanonical} />
        <meta property="og:site_name" content="WorkOnTap" />
        <meta property="og:type" content={pathname.includes("/blogs/") ? "article" : "website"} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
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