import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { Providers } from "@/components/Providers";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM | Casa Design Serra",
  description: "Plataforma de conexões e negócios da Casa Design Serra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={montserrat.className}>
        <Providers>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Topbar genérica minimalista */}
          <header style={{ 
            padding: '1rem 0', 
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--background)'
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.025em', textDecoration: 'none', color: 'inherit' }}>
                CASA DESIGN <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>SERRA</span>
              </Link>
              <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
                <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>Admin</Link>
              </nav>
            </div>
          </header>

          <main style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '2rem 0' }}>
            {children}
          </main>
          
          <footer style={{ 
            padding: '2rem 0', 
            textAlign: 'center', 
            fontSize: '0.875rem', 
            color: 'var(--muted-foreground)',
            backgroundColor: 'var(--background)',
            borderTop: '1px solid var(--border)'
          }}>
            <p>© {new Date().getFullYear()} Casa Design Serra. Todos os direitos reservados.</p>
          </footer>
        </div>
        </Providers>
      </body>
    </html>
  );
}
