import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Mazaya Clinics — Kuwait's Premier Medical Tower Operator",
  description:
    "Al Mazaya Holding Co. KSCP operates 8 state-of-the-art medical clinic towers across Kuwait. Find your ideal specialist clinic space.",
  keywords: "Mazaya Clinics, Kuwait clinic towers, medical space leasing, specialist clinic Kuwait",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
