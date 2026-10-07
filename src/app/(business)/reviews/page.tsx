import type { Metadata } from "next";
import { requireBusiness } from "@/features/org/context";
import { businessReviews } from "@/features/reviews/api";
import { ReviewList } from "@/features/reviews/ReviewList";

export const metadata: Metadata = { title: "Reviews" };

/** Reviews of the business and its venues, with public replies (spec §3, §21). */
export default async function BusinessReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session, org } = await requireBusiness();
  const page = Math.max(0, Number.parseInt((await searchParams).page ?? "0", 10) || 0);
  const { items, meta } = await businessReviews(org.id, session.accessToken, page);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Reviews</h1>
      <p className="text-sm text-muted">
        Replies are public and appear under the review. Report abuse to LordOfSportz from the review itself.
      </p>
      <ReviewList
        items={items}
        meta={meta}
        hrefFor={(p) => `/reviews?page=${p}`}
        emptyTitle="No reviews yet"
      />
    </div>
  );
}
