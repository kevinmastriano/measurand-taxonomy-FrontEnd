import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ToastProvider from "@/components/ToastProvider";
import TaxonomyHistoryPrefetcher from "@/components/TaxonomyHistoryPrefetcher";

export const metadata: Metadata = {
  title: "Measurand Taxonomy Catalog",
  description: "NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy Catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#ffffff] dark:bg-[#0d1117]">
        <TaxonomyHistoryPrefetcher />
        <ToastProvider>
        <Navigation />
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-[#d0d7de] dark:border-[#30363d] mt-24 py-8">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-[#656d76] dark:text-[#8b949e]">
              Copyright © {new Date().getFullYear()} by NCSL International. All rights reserved.
              <br />
              Licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0969da] dark:text-[#58a6ff] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded"
              >
                Creative Commons Attribution-ShareAlike 4.0 International License
              </a>
            </p>
          </div>
        </footer>
        </ToastProvider>
      </body>
    </html>
  );
}

