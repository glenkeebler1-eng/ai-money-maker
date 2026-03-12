import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 赚钱案例库 | AI Money Maker',
  description: '深度解析 AI 变现实战案例，帮助你在 AI 时代找到财富机会。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
