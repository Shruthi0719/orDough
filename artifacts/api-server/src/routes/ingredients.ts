import { Router, type IRouter } from "express";
import { Ingredient, isValidObjectId } from "@workspace/db";
import {
  CreateIngredientBody,
  UpdateIngredientBody,
  UpdateIngredientParams,
  DeleteIngredientParams,
  ListIngredientsResponse,
  UpdateIngredientResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/ingredients", async (_req, res): Promise<void> => {
  const items = await Ingredient.find().sort({ createdAt: 1 });
  res.json(ListIngredientsResponse.parse(items.map(serializeIngredient)));
});

router.post("/ingredients", async (req, res): Promise<void> => {
  const parsed = CreateIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = await Ingredient.create({
    name: parsed.data.name,
    unit: parsed.data.unit,
    stock: parsed.data.stock,
    costPerUnit: parsed.data.costPerUnit,
    minStock: parsed.data.minStock,
  });
  res.status(201).json(serializeIngredient(item));
});

router.patch("/ingredients/:id", async (req, res): Promise<void> => {
  const params = UpdateIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateIngredientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
  if (parsed.data.stock !== undefined) updateData.stock = parsed.data.stock;
  if (parsed.data.costPerUnit !== undefined) updateData.costPerUnit = parsed.data.costPerUnit;
  if (parsed.data.minStock !== undefined) updateData.minStock = parsed.data.minStock;

  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid ingredient id" });
    return;
  }
  const item = await Ingredient.findByIdAndUpdate(params.data.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }
  res.json(UpdateIngredientResponse.parse(serializeIngredient(item)));
});

router.delete("/ingredients/:id", async (req, res): Promise<void> => {
  const params = DeleteIngredientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid ingredient id" });
    return;
  }
  const item = await Ingredient.findByIdAndDelete(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeIngredient(ingredient: { toJSON(): unknown }) {
  return ingredient.toJSON();
}

export default router;
