import { privateMetadata } from "@/lib/seo";
export const metadata = privateMetadata;
import PageShell from "@/components/page-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PageShell area="Quản trị">{children}</PageShell>;
}
