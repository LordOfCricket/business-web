import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { receivedReviews } from "@/features/reviews/api";
import { ReviewList } from "@/features/reviews/ReviewList";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My reviews" };
export const dynamic = "force-dynamic";

/** Reviews of the signed-in professional's profile, with public replies (spec §12). */
export default async function ProfessionalReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile/reviews");
  const page = Math.max(0, Number.parseInt((await searchParams).page ?? "0", 10) || 0);
  const { items, meta } = await receivedReviews(session.accessToken, page);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Reviews of my profile</h1>
      <ReviewList
        items={items}
        meta={meta}
        hrefFor={(p) => `/profile/reviews?page=${p}`}
        emptyTitle="No reviews yet"
      />
    </div>
  );
}
