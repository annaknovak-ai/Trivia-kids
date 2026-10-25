import type { Metadata, Viewport } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-rubik",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "חידונצ'יק",
  description: "שאלות טריוויה מותאמות במיוחד בשבילכם",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8F6FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
      <body>
        <div className="app-frame">{children}</div>
      </body>
    </html>
  );
}
