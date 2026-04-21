import { useState } from "react";
import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: orders, isLoading } = useListOrders();
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Orders</h1>
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

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Card>
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
                        <Link 
                          href={`/admin/invoice/${order.id}`} 
                          className="inline-flex items-center justify-center p-2 text-[#79A3C3] hover:text-[#3A2119] hover:bg-[#D2E2EC] rounded-md transition-colors"
                          title="View Invoice"
                        >
                          <FileText size={16} />
                        </Link>
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
