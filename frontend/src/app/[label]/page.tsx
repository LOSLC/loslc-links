import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

interface Props {
  params: Promise<{ label: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { label } = await params;
    const link = await apiClient.getLinkByLabel(label);

    return {
      title: `${link.label} - Link Shortener`,
      description: link.description || `Redirecting to ${link.url}`,
      openGraph: {
        title: link.label,
        description: link.description || `Redirecting to ${link.url}`,
        url: link.url,
      },
    };
  } catch {
    return {
      title: "Link Not Found",
      description: "The requested link could not be found",
    };
  }
}

export default async function LinkPage({ params }: Props) {
  const { label } = await params;
  
  try {
    const link = await apiClient.getLinkByLabel(label);
    
    // Redirect to the actual URL - this will throw internally, which is expected
    console.log(`Redirecting to: ${link.url}`);
    redirect(link.url);
  } catch (error) {
    // Only show 404 if the error is from the API call, not from redirect
    // The redirect function throws a special error that should be allowed to propagate
    if (error && typeof error === 'object' && 'digest' in error) {
      // This is a Next.js redirect error, re-throw it
      throw error;
    }
    
    // This is an API error, show 404 page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Link Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The link you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }
}
