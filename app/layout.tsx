import { Toaster } from "@/components/ui/sonner";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import Header from "@/components/Header";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormCraft",
  description: "Create and share online forms effortlessly",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UserProvider>
        <html lang="en">
          <body className={`${roboto.className}`}>
            {children}
            <Toaster />
          </body>
        </html>
      </UserProvider>
    </ClerkProvider>
  );
}
