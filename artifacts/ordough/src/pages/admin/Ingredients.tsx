import { useState } from "react";
import { useListIngredients, useUpdateIngredient, getListIngredientsQueryKey, useCreateIngredient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Plus } from "lucide-react";

export default function Ingredients() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [totalQty, setTotalQty] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const { data: ingredients, isLoading } = useListIngredients();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const costPerUnit = totalQty > 0 ? (totalPrice / totalQty).toFixed(4) : "0.0000";

  const handleAddIngredient = () => {
    createIngredient.mutate(
      {
        name,
        unit,
        costPerUnit: parseFloat(costPerUnit),
        stock: totalQty,
        minStock,
      },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          setName("");
          setUnit("g");
          setTotalQty(0);
          setTotalPrice(0);
          setMinStock(0);
          queryClient.invalidateQueries({ queryKey: getListIngredientsQueryKey() });
          toast({ title: "Ingredient added" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add ingredient", variant: "destructive" });
        }
      }
    );
  };

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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3A2119] text-[#EBCDB7] hover:bg-[#957662] px-4 py-2 text-sm uppercase tracking-widest">
              <Plus size={16} className="mr-2" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalQty">Total Quantity Purchased</Label>
                  <Input id="totalQty" type="number" value={totalQty} onChange={(e) => setTotalQty(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label htmlFor="totalPrice">Total Price Paid (Rs.)</Label>
                  <Input id="totalPrice" type="number" value={totalPrice} onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <Label>Cost per Unit</Label>
                <div className="text-lg font-bold">₹{costPerUnit} / {unit}</div>
              </div>
              <div>
                <Label htmlFor="minStock">Minimum Stock Alert Level</Label>
                <Input id="minStock" type="number" value={minStock} onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Initial Stock</Label>
                <div className="text-lg">{totalQty} {unit}</div>
              </div>
              <Button onClick={handleAddIngredient} className="w-full">Add Ingredient</Button>
            </div>
          </DialogContent>
        </Dialog>
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
