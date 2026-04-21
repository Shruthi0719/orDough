import { Router, type IRouter } from "express";
import { MenuItem, isValidObjectId } from "@workspace/db";
import { requireAdmin } from "./auth";
import {
  CreateMenuItemBody,
  UpdateMenuItemBody,
  GetMenuItemParams,
  UpdateMenuItemParams,
  DeleteMenuItemParams,
  ListMenuItemsResponse,
  GetMenuItemResponse,
  UpdateMenuItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu", async (req, res): Promise<void> => {
  const items = await MenuItem.find().sort({ createdAt: 1 });
  res.json(ListMenuItemsResponse.parse(items.map(serializeMenuItem)));
});

router.post("/menu", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = await MenuItem.create({
    name: parsed.data.name,
    emoji: parsed.data.emoji ?? "🍪",
    category: parsed.data.category,
    price: parsed.data.price,
    cost: parsed.data.cost,
    description: parsed.data.description ?? null,
    available: parsed.data.available ?? true,
  });
  res.status(201).json(GetMenuItemResponse.parse(serializeMenuItem(item)));
});

router.get("/menu/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid menu item id" });
    return;
  }
  const item = await MenuItem.findById(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(GetMenuItemResponse.parse(serializeMenuItem(item)));
});

router.patch("/menu/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.emoji !== undefined) updateData.emoji = parsed.data.emoji;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price;
  if (parsed.data.cost !== undefined) updateData.cost = parsed.data.cost;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.available !== undefined) updateData.available = parsed.data.available;

  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid menu item id" });
    return;
  }
  const item = await MenuItem.findByIdAndUpdate(params.data.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(UpdateMenuItemResponse.parse(serializeMenuItem(item)));
});

router.delete("/menu/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid menu item id" });
    return;
  }
  const item = await MenuItem.findByIdAndDelete(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeMenuItem(item: { toJSON(): unknown }) {
  return item.toJSON();
}

export default router;
