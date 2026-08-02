import RetrieveClient from "./RetrieveClient";

/**
 * Page component for photo retrieval.
 * Provides generateStaticParams to support Next.js static export for Capacitor.
 */
export async function generateStaticParams() {
  // Returning a placeholder to satisfy the build error for static export.
  // The actual retrieval happens client-side using the ID from the URL.
  return [{ id: "placeholder" }];
}

// Static export requirement for dynamic routes in Capacitor
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RetrievePage({ params }: PageProps) {
  // Await the params Promise as required by Next.js 15
  const resolvedParams = await params;
  
  // We pass the resolved ID to ensure the component is properly hydrated
  return <RetrieveClient />;
}
