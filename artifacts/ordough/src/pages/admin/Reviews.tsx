import { useListReviews, useUpdateReview, useDeleteReview, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Reviews() {
  const { data: reviews, isLoading } = useListReviews();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });

  const handleApprove = (id: string) => {
    updateReview.mutate(
      { id, data: { approved: true } },
      { onSuccess: () => { invalidate(); toast({ title: "Review approved — now visible publicly." }); } },
    );
  };

  const handleReject = (id: string) => {
    updateReview.mutate(
      { id, data: { approved: false } },
      { onSuccess: () => { invalidate(); toast({ title: "Review hidden from public." }); } },
    );
  };

  const handleDelete = (id: string) => {
    deleteReview.mutate(
      { id },
      { onSuccess: () => { invalidate(); toast({ title: "Review deleted." }); } },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Reviews Moderation</h1>
        <div className="text-xs text-[#957662]">
          {reviews?.filter((review) => !review.approved).length ?? 0} pending approval
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews?.map((review) => (
            <Card key={review.id} className={`admin-card border ${review.approved ? "border-green-200 bg-[#EBCDB7]" : "border-amber-200 bg-[#EBCDB7]"}`}>
              <CardContent className="p-6 flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#3A2119]">{review.customerName}</h3>
                      <p className="text-xs text-[#3A2119]/50">
                        {format(new Date(review.createdAt), "PPP")}
                        {review.product ? ` · ${review.product}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        review.approved
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {review.approved ? "Approved" : "Pending"}
                      </span>
                      <div className="flex gap-0.5 text-[#957662]">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className={`w-3.5 h-3.5 ${j < review.rating ? "fill-current" : "fill-gray-200"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[#3A2119]/80 italic mt-2">"{review.comment}"</p>
                </div>
                <div className="flex flex-col gap-2 border-l border-[#EBCDB7]/50 pl-5 min-w-[90px]">
                  {!review.approved ? (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="bg-[#3A2119] text-[#EBCDB7] px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-[#957662] transition-colors rounded-sm"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(review.id)}
                      className="bg-[#957662] text-white px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-[#3A2119] transition-colors rounded-sm"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="bg-red-700 text-white px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-red-800 transition-colors rounded-sm"
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
