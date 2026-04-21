import { useState } from "react";
import { useListCustomers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search } from "lucide-react";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: customers, isLoading } = useListCustomers({ search: searchTerm });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Customers</h1>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#3A2119]/50" />
          <Input 
            placeholder="Search customers..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Total Orders</th>
                    <th className="px-6 py-3">Total Spent</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBCDB7]/50">
                  {customers?.map(customer => (
                    <tr key={customer.id} className="hover:bg-[#D2E2EC]/50 cursor-pointer transition-colors">
                      <td className="px-6 py-4 font-medium text-[#3A2119]">{customer.name}</td>
                      <td className="px-6 py-4 text-[#3A2119]/70">
                        <div>{customer.email || '—'}</div>
                        <div className="text-xs">{customer.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4">{customer.totalOrders}</td>
                      <td className="px-6 py-4 font-price font-bold">₹{customer.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-[#3A2119]/70">{format(new Date(customer.createdAt), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                  {customers?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#3A2119]/50">No customers found.</td>
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
