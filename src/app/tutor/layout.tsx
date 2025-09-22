import { PageClientLayout } from "@/components/layout/PageClientLayout";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageClientLayout>{children}</PageClientLayout>;
}
