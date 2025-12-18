import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

interface PostLayoutProps {
  children: ReactNode;
}

export function PostLayout({ children }: PostLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
