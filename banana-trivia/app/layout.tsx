import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '../components/ErrorBoundary';
import RefreshWarning from '../components/RefreshWarning';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Banana Trivia - Math Challenge Game',
  description: 'Test your math skills in this fast-paced trivia game with multiple difficulty levels',
  keywords: ['trivia', 'math', 'game', 'challenge', 'banana', 'quiz'],
  authors: [{ name: 'Banana Trivia Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#fbbf24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <RefreshWarning />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}