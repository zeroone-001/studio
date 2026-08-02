
import RetrieveClient from "./RetrieveClient";

/**
 * Page component for photo retrieval.
 * Satisfies Next.js static export requirement while handling dynamic IDs at runtime.
 */
export async function generateStaticParams() {
  // Return a placeholder ID to ensure the static page /retrieve/placeholder/index.html is generated.
  // The RetrieveClient handles the actual ID from the URL at runtime.
  return [{ id: "placeholder" }];
}

// In static export mode, this must be false
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RetrievePage({ params }: PageProps) {
  // Await params as required by Next.js 15
  const resolvedParams = await params;
  
  return <RetrieveClient />;
}
