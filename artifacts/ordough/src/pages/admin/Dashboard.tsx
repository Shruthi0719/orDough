import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, PackageOpen, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A2119]"></div>
      </div>
    );
  }

  const safeSummary = {
    totalOrders: summary?.totalOrders ?? 0,
    pendingOrders: summary?.pendingOrders ?? 0,
    todayRevenue: summary?.todayRevenue ?? 0,
    totalRevenue: summary?.totalRevenue ?? 0,
    totalCustomers: summary?.totalCustomers ?? 0,
    topSellingItem: summary?.topSellingItem ?? null,
    lowStockCount: summary?.lowStockCount ?? 0,
    recentOrders: summary?.recentOrders ?? [],
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A2119]/70">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#3A2119]/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-price text-[#3A2119]">₹{safeSummary.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-[#3A2119]/50 mt-1">
              Total: ₹{safeSummary.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A2119]/70">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#3A2119]/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3A2119]">{safeSummary.pendingOrders}</div>
            <p className="text-xs text-[#3A2119]/50 mt-1">
              Out of {safeSummary.totalOrders} total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A2119]/70">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-[#3A2119]/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3A2119]">{safeSummary.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A2119]/70">Low Stock Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-[#3A2119]/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3A2119]">{safeSummary.lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#3A2119] font-serif text-xl">Recent Orders</CardTitle>
            </div>
            <Link href="/admin/orders" className="text-sm text-[#79A3C3] hover:text-[#3A2119] flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeSummary.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-[#EBCDB7]/20 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-[#3A2119]">{order.customerName}</div>
                    <div className="text-sm text-[#3A2119]/60">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-price text-[#3A2119]">
                      ₹{(order.items.reduce((acc, item) => acc + (item.price * item.qty), 0) - order.discount + order.deliveryCharge).toFixed(2)}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#79A3C3]">{order.status}</div>
                  </div>
                </div>
              ))}
              {safeSummary.recentOrders.length === 0 && (
                <div className="text-center py-4 text-[#3A2119]/50 text-sm">No recent orders</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#EBCDB7]/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#3A2119] font-serif text-xl">Top Selling Item</CardTitle>
          </CardHeader>
          <CardContent>
            {safeSummary.topSellingItem ? (
              <div className="text-center py-8">
                <div className="text-2xl font-serif text-[#3A2119] mb-2">{safeSummary.topSellingItem}</div>
                <div className="text-[#3A2119]/60 text-sm">Our customers' absolute favorite</div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#3A2119]/50 text-sm">Not enough data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
