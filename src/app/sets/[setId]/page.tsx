import { notFound } from "next/navigation";
import { SetLanding } from "@/components/SetLanding";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSetById, photoSets } from "@/config/sets";
import { siteContent } from "@/config/site-content";

interface SetPageProps {
  params: { setId: string };
}

export function generateStaticParams() {
  return photoSets.map((set) => ({ setId: set.id }));
}

export function generateMetadata({ params }: SetPageProps) {
  const photoSet = getSetById(params.setId);
  if (!photoSet) return { title: "Set Not Found" };

  return {
    title: `${photoSet.name} — ${siteContent.brand.name}`,
    description: photoSet.description,
  };
}

export default function SetPage({ params }: SetPageProps) {
  const photoSet = getSetById(params.setId);
  if (!photoSet) notFound();

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-10 py-8 sm:py-12 lg:py-16">
        <SetLanding setId={params.setId} />
      </div>

      <SiteFooter />
    </main>
  );
}
