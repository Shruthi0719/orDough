import { Router, type IRouter } from "express";
import { Review, isValidObjectId } from "@workspace/db";
import { isAdminAuthenticated, requireAdmin } from "./auth";
import {
  CreateReviewBody,
  UpdateReviewBody,
  UpdateReviewParams,
  DeleteReviewParams,
  ListReviewsResponse,
  UpdateReviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const query = isAdminAuthenticated(req) ? {} : { approved: true };
  const items = await Review.find(query).sort({ createdAt: 1 });
  res.json(ListReviewsResponse.parse(items.map(serializeReview)));
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = await Review.create({
    customerName: parsed.data.customerName,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    product: parsed.data.product ?? null,
    approved: isAdminAuthenticated(req) ? parsed.data.approved ?? false : false,
  });
  res.status(201).json(serializeReview(item));
});

router.patch("/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid review id" });
    return;
  }
  const item = await Review.findByIdAndUpdate(params.data.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(UpdateReviewResponse.parse(serializeReview(item)));
});

router.delete("/reviews/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid review id" });
    return;
  }
  const item = await Review.findByIdAndDelete(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeReview(review: { toJSON(): unknown }) {
  return review.toJSON();
}

export default router;
