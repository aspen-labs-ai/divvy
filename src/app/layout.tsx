import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divvy — Split expenses. Stay friends.",
  description: "Split group expenses effortlessly. No sign up. No credit card. Just split.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#0a0a0a] text-[#fafafa]">{children}</body>
    </html>
  );
}
