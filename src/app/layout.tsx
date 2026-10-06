import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Comercializadora Los Altos - Control de Inventarios y Colocación',
  description: 'Sistema web de gestión de inventarios, colocación y reportería analítica para supermercados independientes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
