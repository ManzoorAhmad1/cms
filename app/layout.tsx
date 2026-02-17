import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Verde CMS',
  description: 'Content Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="body flex bg-[#faf9f6] text-[var(--verde-text)]">
        {/* @ts-expect-error Server Component */}
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

