import { useState } from "react";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey, useCreateOrder, useListMenuItems } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState([{ menuItemId: "", name: "", emoji: "", qty: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [orderStatus, setOrderStatus] = useState("pending");
  const { data: orders, isLoading } = useListOrders();
  const { data: menuItems } = useListMenuItems();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateInvoice = (order: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(58, 33, 25); // #3A2119
    doc.text("orDough Bakery", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(149, 118, 98); // #957662
    doc.text("Invoice", 14, 28);
    doc.text(`Invoice No: ${order.invoiceNumber}`, 14, 34);
    doc.text(`Date: ${format(new Date(order.date), "dd MMM yyyy")}`, 14, 40);
    doc.text(`Customer: ${order.customerName}`, 14, 46);
    autoTable(doc, {
      startY: 54,
      head: [["Item", "Qty", "Unit Price (Rs.)", "Total (Rs.)"]],
      body: order.items.map((item: any) => [
        item.name,
        item.qty,
        item.price.toFixed(2),
        (item.price * item.qty).toFixed(2),
      ]),
      foot: [
        ["", "", "Discount", `-Rs.${order.discount.toFixed(2)}`],
        ["", "", "Delivery", `Rs.${order.deliveryCharge.toFixed(2)}`],
        ["", "", "TOTAL", `Rs.${(
          order.items.reduce((s: number, i: any) => s + i.price * i.qty, 0)
          - order.discount + order.deliveryCharge
        ).toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [58, 33, 25] },
      footStyles: { fontStyle: "bold" },
    });
    doc.save(`orDough_Invoice_${order.invoiceNumber}.pdf`);
  };

  const filteredOrders = orders?.filter(o => statusFilter === "all" || o.status === statusFilter) || [];

  const handleStatusChange = (id: string, newStatus: any) => {
    updateOrder.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order updated", description: `Order status changed to ${newStatus}` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
        }
      }
    );
  };

  const handleAddOrder = () => {
    const payload = {
      customerName,
      customerPhone,
      items: items.filter(item => item.menuItemId),
      discount,
      deliveryCharge,
      status: orderStatus,
    };
    createOrder.mutate(payload, {
      onSuccess: () => {
        setIsAddOrderOpen(false);
        setCustomerName("");
        setCustomerPhone("");
        setItems([{ menuItemId: "", name: "", emoji: "", qty: 1, price: 0 }]);
        setDiscount(0);
        setDeliveryCharge(0);
        setOrderStatus("pending");
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: "Order created", description: "New order has been added successfully" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
      }
    });
  };

  const addItemRow = () => {
    setItems([...items, { menuItemId: "", name: "", emoji: "", qty: 1, price: 0 }]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "menuItemId") {
      const menuItem = menuItems?.find(m => m.id === value);
      if (menuItem) {
        newItems[index].name = menuItem.name;
        newItems[index].emoji = menuItem.emoji;
        newItems[index].price = menuItem.price;
      }
    }
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0) - discount + deliveryCharge;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Orders</h1>
        <div className="flex gap-4">
          <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3A2119] text-[#EBCDB7] hover:bg-[#957662] px-4 py-2 text-sm uppercase tracking-widest">
                <Plus size={16} className="mr-2" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Items</Label>
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end mb-2">
                      <div className="flex-1">
                        <Select value={item.menuItemId} onValueChange={(val) => updateItem(index, "menuItemId", val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems?.map(menuItem => (
                              <SelectItem key={menuItem.id} value={menuItem.id}>
                                {menuItem.emoji} {menuItem.name} - ₹{menuItem.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <div className="text-sm text-gray-600">₹{(item.price * item.qty).toFixed(2)}</div>
                      <Button variant="outline" size="sm" onClick={() => removeItemRow(index)}>✕</Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addItemRow}>Add Item</Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount (₹)</Label>
                    <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label htmlFor="delivery">Delivery Charge (₹)</Label>
                    <Input id="delivery" type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Order Total</Label>
                    <div className="text-lg font-bold">₹{total.toFixed(2)}</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddOrder} className="w-full">Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#D2E2EC] border-b border-[#EBCDB7] text-[#3A2119]">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBCDB7]/50">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#D2E2EC]/50">
                      <td className="px-6 py-4 font-medium text-[#3A2119]">{order.invoiceNumber}</td>
                      <td className="px-6 py-4 text-[#3A2119]/70">{format(new Date(order.date), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4 text-right font-price font-bold">
                        ₹{(order.items.reduce((acc, item) => acc + item.price * item.qty, 0) - order.discount + order.deliveryCharge).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => generateInvoice(order)}
                          className="inline-flex items-center justify-center p-2 text-[#79A3C3] hover:text-[#3A2119] hover:bg-[#D2E2EC] rounded-md transition-colors"
                          title="Download Invoice PDF"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#3A2119]/50">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
