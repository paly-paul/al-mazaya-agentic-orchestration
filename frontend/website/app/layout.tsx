import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mazaya Clinics',
  description:
    "Kuwait's Premier Medical Clinic Destination — 8 towers of world-class healthcare facilities in the heart of Kuwait City.",
  keywords: 'Mazaya, clinics, Kuwait, medical, healthcare, facility management',
  openGraph: {
    title: 'Mazaya Clinics',
    description: "Kuwait's Premier Medical Clinic Destination",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
