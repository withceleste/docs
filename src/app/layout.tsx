import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { baseOptions, GITHUB_URL, WEBSITE_URL } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { Github, Globe } from "lucide-react";
import "./global.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider
          search={{
            options: {
              type: "static",
              api: "/api/search",
            },
          }}
        >
          <DocsLayout
            tree={source.pageTree}
            sidebar={{
              footer: (
                <div className="mt-2 flex flex-col gap-1">
                  <a
                    href={WEBSITE_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              ),
            }}
            {...baseOptions()}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
