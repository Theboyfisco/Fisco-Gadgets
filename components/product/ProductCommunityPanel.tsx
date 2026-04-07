"use client";

import { useEffect, useState, useTransition } from "react";
import { MessageCircleQuestion, Star, BellRing } from "lucide-react";
import { subscribeBackInStock, submitProductQuestion, submitProductReview } from "@/actions/product-engagement";
import { useHydrated } from "@/lib/useHydrated";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  author: string;
  createdAt: string;
  verifiedPurchase: boolean;
};

type Question = {
  id: string;
  question: string;
  answer?: string | null;
  status: "OPEN" | "ANSWERED";
  name: string;
  createdAt: string;
};

export function ProductCommunityPanel({
  productId,
  stock,
  initialReviews,
  initialQuestions,
  ratingAverage,
  ratingCount,
}: {
  productId: string;
  stock?: number;
  initialReviews: Review[];
  initialQuestions: Question[];
  ratingAverage: number;
  ratingCount: number;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [questions, setQuestions] = useState(initialQuestions);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [question, setQuestion] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hydrated = useHydrated();

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await submitProductReview({
        productId,
        rating: reviewRating,
        title: reviewTitle || undefined,
        body: reviewBody,
      });
      if (!result.success) {
        setFeedback(result.error || "Unable to submit review.");
        return;
      }

      setFeedback("Review submitted.");
      setReviews((prev) => [
        {
          id: `temp-${Date.now()}`,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
          author: "You",
          createdAt: new Date().toISOString(),
          verifiedPurchase: false,
        },
        ...prev,
      ]);
      setReviewBody("");
      setReviewTitle("");
    });
  };

  const handleQuestionSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await submitProductQuestion({
        productId,
        question,
      });
      if (!result.success) {
        setFeedback(result.error || "Unable to submit question.");
        return;
      }
      setFeedback("Question submitted. We will respond soon.");
      setQuestions((prev) => [
        {
          id: `temp-q-${Date.now()}`,
          question,
          answer: null,
          status: "OPEN",
          name: "You",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setQuestion("");
    });
  };

  const handleStockAlert = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await subscribeBackInStock({
        productId,
        email: alertEmail,
      });
      if (!result.success) {
        setFeedback(result.error || "Unable to register alert.");
        return;
      }
      setFeedback("Back-in-stock alert registered.");
      setAlertEmail("");
    });
  };

  return (
    <section className="mx-auto mt-16 max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Customer ratings</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--foreground)]">Reviews</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--foreground)]">{ratingAverage ? ratingAverage.toFixed(1) : "—"}</p>
              <p className="text-xs text-secondary">{ratingCount} reviews</p>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  className={`rounded-full p-1 ${reviewRating >= value ? "text-primary" : "text-secondary"}`}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star size={16} fill={reviewRating >= value ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <input
              value={reviewTitle}
              onChange={(event) => setReviewTitle(event.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Review title (optional)"
            />
            <textarea
              value={reviewBody}
              onChange={(event) => setReviewBody(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="How was your experience?"
              required
            />
            <button
              type="submit"
              disabled={isPending || reviewBody.trim().length < 8}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              Submit review
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {reviews.slice(0, 4).map((review) => (
              <div key={review.id} className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{review.author}</p>
                  <p className="text-xs text-secondary">
                    {hydrated ? new Date(review.createdAt).toLocaleDateString("en-NG") : "—"}
                  </p>
                </div>
                <p className="mt-1 text-xs text-primary">{`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}</p>
                {review.title ? <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{review.title}</p> : null}
                <p className="mt-1 text-sm text-secondary">{review.body}</p>
                {review.verifiedPurchase ? (
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Verified purchase</p>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Community help</p>
              <h3 className="mt-1 text-xl font-bold text-[var(--foreground)]">Q&A</h3>
            </div>
            <MessageCircleQuestion className="text-primary" size={18} />
          </div>

          <form onSubmit={handleQuestionSubmit} className="space-y-3 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Ask about compatibility, battery life, shipping, or setup."
              required
            />
            <button
              type="submit"
              disabled={isPending || question.trim().length < 8}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              Ask question
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {questions.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.question}</p>
                <p className="mt-1 text-xs text-secondary">Asked by {item.name}</p>
                {item.answer ? (
                  <p className="mt-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-[var(--foreground)]">{item.answer}</p>
                ) : (
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-secondary">Awaiting answer</p>
                )}
              </div>
            ))}
          </div>

          {typeof stock === "number" && stock <= 0 ? (
            <form onSubmit={handleStockAlert} className="mt-5 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--foreground)]">
                <BellRing size={15} className="text-primary" />
                <p className="text-sm font-semibold">Back-in-stock alerts</p>
              </div>
              <p className="mb-3 text-sm text-secondary">Get notified when this product is available again.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={alertEmail}
                  onChange={(event) => setAlertEmail(event.target.value)}
                  type="email"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="you@example.com"
                  required
                />
                <button
                  type="submit"
                  disabled={isPending || !alertEmail}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
                >
                  Notify me
                </button>
              </div>
            </form>
          ) : null}
        </article>
      </div>

      {feedback ? <p className="mt-4 text-sm font-medium text-primary">{feedback}</p> : null}
    </section>
  );
}
