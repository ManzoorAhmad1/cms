import './globals.css';
import { AuthProvider } from './components/AuthProvider';
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
        <AuthProvider>
          <Sidebar />
          {/* pt-14 on mobile accounts for the fixed top bar; lg:ml-64 pushes main past sidebar */}
          <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0 w-full overflow-x-hidden">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}

