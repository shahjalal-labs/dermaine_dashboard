import AssessmentDetails from "@/components/dashboard/Admin/Assessment/AssessmentDetails";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div>
      <AssessmentDetails id={id} />
    </div>
  );
}
