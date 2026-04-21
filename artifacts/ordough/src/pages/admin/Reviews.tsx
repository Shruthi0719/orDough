import { useListReviews, useUpdateReview, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Reviews() {
  const { data: reviews, isLoading } = useListReviews();
  const updateReview = useUpdateReview();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleToggleApproval = (id: string, approved: boolean) => {
    updateReview.mutate(
      { id, data: { approved } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
          toast({ title: approved ? "Review approved" : "Review hidden" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Reviews Moderation</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews?.map(review => (
            <Card key={review.id} className={!review.approved ? "bg-white/50" : ""}>
              <CardContent className="p-6 flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-[#3A2119]">{review.customerName}</h3>
                      <p className="text-xs text-[#3A2119]/50">{format(new Date(review.createdAt), "PPP")} {review.product ? `· ${review.product}` : ""}</p>
                    </div>
                    <div className="flex gap-1 text-[#957662]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className={`w-4 h-4 ${j < review.rating ? "fill-current" : "fill-gray-200"}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-[#3A2119]/80 italic mt-3">"{review.comment}"</p>
                </div>
                <div className="flex flex-col items-center gap-2 border-l border-[#EBCDB7]/50 pl-6">
                  <span className="text-xs uppercase tracking-widest text-[#3A2119]/50 font-medium">Public</span>
                  <Switch 
                    checked={review.approved}
                    onCheckedChange={(c) => handleToggleApproval(review.id, c)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
