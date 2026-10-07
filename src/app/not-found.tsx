import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      action={
        <Link href="/" className="text-sm font-medium text-brand-700 underline">
          Go to the home page
        </Link>
      }
    />
  );
}
