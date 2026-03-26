import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DisasterWatch — Real-Time Disaster Intelligence",
  description:
    "3D global disaster intelligence platform with satellite tracking, live aircraft, ML-powered predictions, and AI-synthesized briefs on a CesiumJS globe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <script src="/situation-script.js" defer />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
