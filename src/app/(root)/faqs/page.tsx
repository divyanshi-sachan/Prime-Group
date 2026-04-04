import { Suspense } from "react";
import { getFaqs } from "@/lib/faqs";
import FaqsSection from "@/components/faqs/FaqsSection";
import { FaqsSkeleton } from "@/components/loading/route-content-skeletons";

async function FaqsContent() {
  const faqs = await getFaqs();
  return <FaqsSection faqs={faqs} />;
}

export default function FAQsPage() {
  return (
    <Suspense fallback={<FaqsSkeleton />}>
      <FaqsContent />
    </Suspense>
  );
}
