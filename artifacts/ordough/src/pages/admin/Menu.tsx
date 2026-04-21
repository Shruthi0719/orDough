import { useState } from "react";
import { useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function Menu() {
  const { data: menuItems, isLoading } = useListMenuItems();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", emoji: "", category: "", price: 0, cost: 0, description: "", available: true
  });

  const handleOpenDialog = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, emoji: item.emoji, category: item.category,
        price: item.price, cost: item.cost, description: item.description || "", available: item.available
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", emoji: "", category: "", price: 0, cost: 0, description: "", available: true });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const action = editingItem 
      ? updateItem.mutateAsync({ id: editingItem.id, data: formData })
      : createItem.mutateAsync({ data: formData as any });

    action.then(() => {
      queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
      toast({ title: "Success", description: `Menu item ${editingItem ? "updated" : "created"}` });
      setIsDialogOpen(false);
    }).catch(() => {
      toast({ title: "Error", description: "Failed to save menu item", variant: "destructive" });
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
          toast({ title: "Success", description: "Menu item deleted" });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Menu Management</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-[#3A2119] hover:bg-[#3A2119] text-white">
          <Plus size={16} className="mr-2" /> Add Item
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input className="col-span-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Emoji</Label>
              <Input className="col-span-3" value={formData.emoji} onChange={e => setFormData({...formData, emoji: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <Input className="col-span-3" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Price</Label>
              <Input type="number" className="col-span-3" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Cost</Label>
              <Input type="number" className="col-span-3" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Available</Label>
              <Switch checked={formData.available} onCheckedChange={c => setFormData({...formData, available: c})} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-[#3A2119] text-white">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems?.map(item => (
            <Card key={item.id} className={!item.available ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-3xl">{item.emoji}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDialog(item)} className="p-1.5 text-[#79A3C3] hover:bg-[#D2E2EC] rounded">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-[#3A2119]">{item.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-price font-bold text-lg">₹{item.price.toFixed(2)}</span>
                  <span className="text-xs uppercase tracking-wider text-[#3A2119]/50 border border-[#EBCDB7] px-2 py-1 rounded-full">{item.category}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
