import { Router, type IRouter } from "express";
import { Recipe, isValidObjectId } from "@workspace/db";
import {
  CreateRecipeBody,
  UpdateRecipeBody,
  UpdateRecipeParams,
  DeleteRecipeParams,
  ListRecipesResponse,
  UpdateRecipeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recipes", async (_req, res): Promise<void> => {
  const items = await Recipe.find().sort({ createdAt: 1 });
  res.json(ListRecipesResponse.parse(items.map(serializeRecipe)));
});

router.post("/recipes", async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = await Recipe.create({
    menuItemId: parsed.data.menuItemId ?? null,
    menuItemName: parsed.data.menuItemName,
    ingredients: parsed.data.ingredients as unknown[],
    instructions: parsed.data.instructions ?? null,
    servings: parsed.data.servings,
  });
  res.status(201).json(serializeRecipe(item));
});

router.patch("/recipes/:id", async (req, res): Promise<void> => {
  const params = UpdateRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.menuItemId !== undefined) updateData.menuItemId = parsed.data.menuItemId;
  if (parsed.data.menuItemName !== undefined) updateData.menuItemName = parsed.data.menuItemName;
  if (parsed.data.ingredients !== undefined) updateData.ingredients = parsed.data.ingredients;
  if (parsed.data.instructions !== undefined) updateData.instructions = parsed.data.instructions;
  if (parsed.data.servings !== undefined) updateData.servings = parsed.data.servings;

  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid recipe id" });
    return;
  }
  const item = await Recipe.findByIdAndUpdate(params.data.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.json(UpdateRecipeResponse.parse(serializeRecipe(item)));
});

router.delete("/recipes/:id", async (req, res): Promise<void> => {
  const params = DeleteRecipeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!isValidObjectId(params.data.id)) {
    res.status(400).json({ error: "Invalid recipe id" });
    return;
  }
  const item = await Recipe.findByIdAndDelete(params.data.id);
  if (!item) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeRecipe(recipe: { toJSON(): unknown }) {
  return recipe.toJSON();
}

export default router;
