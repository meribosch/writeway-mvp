import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { AIAssistantProvider } from './context/AIAssistantContext'
import Navbar from './components/Navbar'
import AIAssistantWrapper from './components/AIAssistantWrapper'

export const metadata: Metadata = {
  title: 'Writeway - The Right Way to Write',
  description: 'Share your stories with the world in a beautiful, engaging way.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <AIAssistantProvider>
            <div className="min-h-screen bg-background-light">
              <Navbar />
              <main className="py-6">
                {children}
              </main>
              <AIAssistantWrapper />
              <footer className="bg-white border-t border-gray-200 py-8 mt-12">
                <div className="container mx-auto px-4 text-center">
                  <p className="text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} Writeway. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </AIAssistantProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 