import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Plus, FileCheck } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "NCSLI MII Measurand Taxonomy Catalog",
  description: "NCSLI MII Measurand Taxonomy Catalog - Digital measurement standards and procedures.",
  keywords: "metrology, measurement, taxonomy, NCSL, calibration, standards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Link href="/" className="hover:opacity-80 transition-opacity">
                    <h1 className="text-2xl font-extrabold text-primary">
                      Measurand Taxonomy
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      NCSLI MII Measurand Taxonomy Catalog
                    </p>
                  </Link>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link href="/docs/specification">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Specification
                    </Button>
                  </Link>
                  <Link href="/docs/copyright">
                    <Button variant="outline" size="sm">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Copyright
                    </Button>
                  </Link>
                  <Link href="/review">
                    <Button variant="outline" size="sm">
                      <FileCheck className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </Link>
                  <Link href="/add-measurand">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit New Measurand
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t bg-card py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2024 NCSL International. Licensed under CC BY-SA 4.0</p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
