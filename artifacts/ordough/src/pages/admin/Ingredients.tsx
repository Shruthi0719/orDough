import { useState } from "react";
import { useListIngredients, useUpdateIngredient, getListIngredientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function Ingredients() {
  const { data: ingredients, isLoading } = useListIngredients();
  const updateIngredient = useUpdateIngredient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStockUpdate = (id: string, newStock: number) => {
    updateIngredient.mutate(
      { id, data: { stock: newStock } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListIngredientsQueryKey() });
          toast({ title: "Stock updated" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Ingredient Stock</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients?.map(ing => {
            const isLow = ing.stock <= ing.minStock;
            return (
              <Card key={ing.id} className={isLow ? "border-red-200 bg-red-50/30" : ""}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#3A2119] flex items-center gap-2">
                        {ing.name}
                        {isLow && <AlertCircle size={16} className="text-red-500" />}
                      </h3>
                      <p className="text-xs text-[#3A2119]/50">Cost: ₹{ing.costPerUnit.toFixed(2)} / {ing.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-[#3A2119]">Current Stock:</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="w-20 h-8 text-right" 
                        defaultValue={ing.stock}
                        onBlur={(e) => handleStockUpdate(ing.id, Number(e.target.value))}
                      />
                      <span className="text-sm text-[#3A2119]/70 w-8">{ing.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
