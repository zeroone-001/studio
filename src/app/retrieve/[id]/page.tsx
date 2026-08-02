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

// Ensure static export behavior for dynamic routes
export const dynamicParams = false;

export default async function RetrievePage({ params }: { params: Promise<{ id: string }> }) {
  // Await params as required by Next.js 15
  await params;
  
  return <RetrieveClient />;
}
