import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Tanzania Contacts | Status Views",
  description: "Usajili wa Tanzania Contacts Status Views."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sw"><body>{children}</body></html>;
}
