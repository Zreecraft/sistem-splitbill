import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncTrip — Real-time Collaborative Trip & Expense Planner",
  description:
    "Rencanakan perjalanan bersama secara real-time. Kelola itinerary, split expenses, dan sinkronkan semua perubahan secara instan dengan tim kamu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
