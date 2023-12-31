import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CanvasComponent from './CanvasComponent';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Post Creator',
  description: 'Create Instagram Posts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <CanvasComponent />
        {children}
      </body>
    </html>
  );
}
