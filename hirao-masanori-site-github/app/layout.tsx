import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "平尾正憲（三鷹市）公式サイト";
const description =
  "平尾正憲（三鷹市）の公式サイト。将来世代に責任ある政治へ。安定と調和を次世代へ。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    icons: { icon: "/profile.jpg", shortcut: "/profile.jpg" },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      title,
      description,
      images: [{ url: imageUrl, width: 1734, height: 907, alt: "平尾正憲 三鷹市 公式サイト" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
