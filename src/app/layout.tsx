import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/seo";

const notoSans = localFont({ src: "../../public/fonts/NotoSans-Regular.ttf", variable: "--font-noto-sans", display: "swap" });

import "./globals.css";



export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Class Deadline Hub", template: "%s | Class Deadline Hub" },
  description: "Quản lý deadline theo môn học dành cho lớp sinh viên PTIT.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
