import { Router, type IRouter } from "express";
import { Customer, Ingredient, MenuItem, Order } from "@workspace/db";
import { GetDashboardSummaryResponse, GetProfitReportResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allOrders = await Order.find();
  const allCustomers = await Customer.find();
  const allIngredients = await Ingredient.find();
  const todayRevenue = allOrders
    .filter((o) => new Date(o.date) >= today)
    .reduce((sum, o) => {
      const itemsTotal = (Array.isArray(o.items) ? o.items as Array<{ qty: number; price: number }> : [])
        .reduce((s, item) => s + item.qty * item.price, 0);
      return sum + itemsTotal - o.discount + o.deliveryCharge;
    }, 0);

  const totalRevenue = allOrders.reduce((sum, o) => {
    const itemsTotal = (Array.isArray(o.items) ? o.items as Array<{ qty: number; price: number }> : [])
      .reduce((s, item) => s + item.qty * item.price, 0);
    return sum + itemsTotal - o.discount + o.deliveryCharge;
  }, 0);

  const recentOrders = allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(serializeOrder);

  const itemCounts: Record<string, number> = {};
  for (const order of allOrders) {
    for (const item of (Array.isArray(order.items) ? order.items as Array<{ name: string; qty: number }> : [])) {
      itemCounts[item.name] = (itemCounts[item.name] ?? 0) + item.qty;
    }
  }
  const topSellingItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const summary = {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((order) => order.status === "pending").length,
    todayRevenue,
    totalRevenue,
    totalCustomers: allCustomers.length,
    topSellingItem,
    lowStockCount: allIngredients.filter((ingredient) => ingredient.stock < ingredient.minStock).length,
    recentOrders,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/profit", async (_req, res): Promise<void> => {
  const orders = await Order.find();
  const menuItems = await MenuItem.find();
  const menuMap = new Map(menuItems.map((m) => [m.name, { price: m.price, cost: m.cost, category: m.category }]));

  let totalRevenue = 0;
  let totalCost = 0;
  const categoryMap: Record<string, { revenue: number; cost: number }> = {};
  const monthMap: Record<string, { revenue: number; orders: number }> = {};

  for (const order of orders) {
    const items = (Array.isArray(order.items) ? order.items as Array<{ name: string; qty: number; price: number }> : []);
    const orderRevenue = items.reduce((s, i) => s + i.qty * i.price, 0) - order.discount + order.deliveryCharge;
    const orderCost = items.reduce((s, i) => {
      const menuItem = menuMap.get(i.name);
      return s + i.qty * (menuItem?.cost ?? 0);
    }, 0);

    totalRevenue += orderRevenue;
    totalCost += orderCost;

    for (const item of items) {
      const menuItem = menuMap.get(item.name);
      if (menuItem) {
        const cat = menuItem.category;
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, cost: 0 };
        categoryMap[cat].revenue += item.qty * item.price;
        categoryMap[cat].cost += item.qty * menuItem.cost;
      }
    }

    const month = new Date(order.date).toISOString().slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { revenue: 0, orders: 0 };
    monthMap[month].revenue += orderRevenue;
    monthMap[month].orders += 1;
  }

  const byCategory = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    revenue: data.revenue,
    cost: data.cost,
    profit: data.revenue - data.cost,
  }));

  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, revenue: data.revenue, orders: data.orders }));

  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  res.json(GetProfitReportResponse.parse({ totalRevenue, totalCost, grossProfit, profitMargin, byCategory, byMonth }));
});

function serializeOrder(order: { toJSON(): unknown }) {
  return order.toJSON();
}

export default router;
