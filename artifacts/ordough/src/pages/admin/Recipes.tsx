import { useMemo, useState } from "react";
import {
  useListRecipes,
  useCreateRecipe,
  useListMenuItems,
  useListIngredients,
  getListRecipesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";

export default function Recipes() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [menuItemId, setMenuItemId] = useState("");
  const [batchSize, setBatchSize] = useState(12);
  const [instructions, setInstructions] = useState("");
  const [ingredientRows, setIngredientRows] = useState([
    { ingredientId: "", quantity: 0 },
  ]);

  const { data: recipes, isLoading } = useListRecipes();
  const { data: menuItems } = useListMenuItems();
  const { data: allIngredients } = useListIngredients();
  const createRecipe = useCreateRecipe();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const selectedMenuItem = useMemo(
    () => menuItems?.find((item) => item.id === menuItemId),
    [menuItems, menuItemId],
  );
  const sellingPrice = selectedMenuItem ? Number(selectedMenuItem.price) : 0;

  const rawIngredientCost = useMemo(
    () =>
      ingredientRows.reduce((sum, row) => {
        const ingredient = allIngredients?.find((item) => item.id === row.ingredientId);
        return sum + (ingredient ? Number(ingredient.costPerUnit) * (row.quantity || 0) : 0);
      }, 0),
    [allIngredients, ingredientRows],
  );

  const OVERHEAD = 15;
  const totalBatchCost = rawIngredientCost + OVERHEAD;
  const costPerItem = batchSize > 0 ? totalBatchCost / batchSize : 0;
  const profitPerItem = sellingPrice - costPerItem;
  const profitMargin = sellingPrice > 0 ? (profitPerItem / sellingPrice) * 100 : 0;

  const addRow = () => setIngredientRows((rows) => [...rows, { ingredientId: "", quantity: 0 }]);
  const removeRow = (idx: number) => setIngredientRows((rows) => rows.filter((_, index) => index !== idx));
  const updateRow = (idx: number, field: string, value: string | number) => {
    setIngredientRows((rows) =>
      rows.map((row, index) => (index === idx ? { ...row, [field]: value } : row)),
    );
  };

  const handleSubmit = async () => {
    if (!menuItemId) {
      toast({ title: "Select a menu item", variant: "destructive" });
      return;
    }

    const validRows = ingredientRows.filter((row) => row.ingredientId && row.quantity > 0);
    if (validRows.length === 0) {
      toast({ title: "Add at least one ingredient", variant: "destructive" });
      return;
    }

    await createRecipe.mutateAsync({
      data: {
        menuItemId,
        servings: batchSize,
        instructions,
        ingredients: validRows.map((row) => ({
          ingredientId: row.ingredientId,
          quantity: row.quantity,
        })),
      },
    });

    queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
    toast({ title: "Recipe saved!" });
    setIsAddOpen(false);
    setMenuItemId("");
    setBatchSize(12);
    setInstructions("");
    setIngredientRows([{ ingredientId: "", quantity: 0 }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Recipes</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3A2119] text-[#EBCDB7] hover:bg-[#957662] uppercase tracking-widest text-xs px-4 py-2">
              <Plus size={15} className="mr-2" /> Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-[#3A2119]">
                New Recipe
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-widest text-[#957662]">
                  Linked Menu Item
                </Label>
                <Select value={menuItemId} onValueChange={setMenuItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ₹{item.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-widest text-[#957662]">
                  Batch Size (items per batch)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={batchSize}
                  onChange={(event) => setBatchSize(Number(event.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-[#957662]">
                  Ingredients
                </Label>
                {ingredientRows.map((row, idx) => {
                  const ingredient = allIngredients?.find((item) => item.id === row.ingredientId);
                  const rowCost = ingredient
                    ? (Number(ingredient.costPerUnit) * (row.quantity || 0)).toFixed(2)
                    : "—";

                  return (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select
                        value={row.ingredientId}
                        onValueChange={(value) => updateRow(idx, "ingredientId", value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Ingredient..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allIngredients?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        className="w-20"
                        placeholder="Qty"
                        value={row.quantity || ""}
                        onChange={(event) => updateRow(idx, "quantity", Number(event.target.value))}
                      />
                      <span className="text-xs text-[#957662] w-16 text-right">
                        {ingredient ? ingredient.unit : ""} • ₹{rowCost}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="text-red-500 hover:text-red-700 text-lg leading-none px-1"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs text-[#79A3C3] hover:underline mt-1"
                >
                  + Add ingredient row
                </button>
              </div>

              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-widest text-[#957662]">
                  Instructions (optional)
                </Label>
                <Textarea
                  rows={3}
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Steps, tips, bake time..."
                />
              </div>

              <div className="bg-[#D2E2EC]/40 border border-[#957662]/30 rounded p-4 space-y-1.5 text-sm">
                <div className="text-xs uppercase tracking-widest text-[#957662] mb-2 font-medium">
                  Cost Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2119]/70">Raw Ingredient Cost</span>
                  <span className="font-medium text-[#3A2119]">
                    ₹{rawIngredientCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2119]/70">
                    Overhead / Labour (fixed)
                  </span>
                  <span className="text-[#3A2119]">₹{OVERHEAD}.00</span>
                </div>
                <div className="flex justify-between border-t border-[#957662]/20 pt-1">
                  <span className="text-[#3A2119]/70">Total Batch Cost</span>
                  <span className="font-bold text-[#3A2119]">
                    ₹{totalBatchCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2119]/70">Cost per Item</span>
                  <span className="font-bold text-[#3A2119]">
                    ₹{costPerItem.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#957662]/20 pt-1">
                  <span className="text-[#3A2119]/70">Selling Price</span>
                  <span className="text-[#79A3C3] font-bold">
                    ₹{sellingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2119]/70">Profit per Item</span>
                  <span className={profitPerItem >= 0 ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                    ₹{profitPerItem.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3A2119]/70">Profit Margin</span>
                  <span className={profitMargin >= 0 ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createRecipe.isPending}
                className="w-full bg-[#3A2119] text-[#EBCDB7] hover:bg-[#957662]"
              >
                {createRecipe.isPending ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recipes?.map((recipe) => (
            <Card key={recipe.id} className="admin-card bg-[#EBCDB7] border-[#957662]/30">
              <CardHeader className="pb-3 border-b border-[#EBCDB7]/30">
                <CardTitle className="text-[#3A2119] flex items-center gap-2 text-lg">
                  <BookOpen size={18} className="text-[#79A3C3]" />
                  {recipe.menuItemName}
                </CardTitle>
                <div className="text-xs text-[#3A2119]/60">
                  Makes {recipe.servings} per batch
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-1 text-sm text-[#3A2119]">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li
                      key={i}
                      className="flex justify-between border-b border-[#EBCDB7]/20 pb-1 last:border-0"
                    >
                      <span>{ingredient.ingredientName}</span>
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
                {recipe.instructions && (
                  <p className="text-sm text-[#3A2119]/70 mt-3 whitespace-pre-wrap">
                    {recipe.instructions}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
