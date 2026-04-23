import { useGetProfitReport, useListMenuItems, useListRecipes, useListIngredients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Profit() {
  const { data: report, isLoading } = useGetProfitReport();
  const { data: menuItems } = useListMenuItems();
  const { data: recipes } = useListRecipes();
  const { data: ingredients } = useListIngredients();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const safeReport = {
    totalRevenue: report?.totalRevenue ?? 0,
    totalCost: report?.totalCost ?? 0,
    grossProfit: report?.grossProfit ?? 0,
    profitMargin: report?.profitMargin ?? 0,
    byMonth: report?.byMonth ?? [],
    byCategory: report?.byCategory ?? [],
  };

  const perItemData = (menuItems ?? []).map((item) => {
    const recipe = (recipes ?? []).find((entry) => entry.menuItemId === item.id);
    if (!recipe) return { item, costPerItem: null, profitPerItem: null, margin: null };

    const rawCost = recipe.ingredients.reduce((sum, recipeIngredient) => {
      const ingredient = (ingredients ?? []).find((entry) => entry.id === recipeIngredient.ingredientId);
      return sum + (ingredient ? Number(ingredient.costPerUnit) * Number(recipeIngredient.quantity) : 0);
    }, 0);

    const overhead = 15;
    const costPerItem = (rawCost + overhead) / recipe.servings;
    const profitPerItem = Number(item.price) - costPerItem;
    const margin = Number(item.price) > 0 ? (profitPerItem / Number(item.price)) * 100 : 0;
    return { item, costPerItem, profitPerItem, margin };
  });

  const linkedItems = perItemData.filter((entry) => entry.costPerItem !== null);
  const avgMargin = linkedItems.length > 0
    ? linkedItems.reduce((sum, entry) => sum + (entry.margin ?? 0), 0) / linkedItems.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Profitability Report</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Total Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-[#3A2119]">₹{safeReport.totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Total Cost</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-red-700">₹{safeReport.totalCost.toFixed(2)}</div></CardContent>
        </Card>
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Gross Profit</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-green-700">₹{safeReport.grossProfit.toFixed(2)}</div></CardContent>
        </Card>
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Profit Margin</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-[#3A2119]">{safeReport.profitMargin.toFixed(1)}%</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader>
            <CardTitle className="text-[#3A2119] font-serif">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeReport.byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#957662" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{ fill: "#D2E2EC" }} />
                <Bar dataKey="revenue" fill="#3A2119" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader>
            <CardTitle className="text-[#3A2119] font-serif">Profit by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeReport.byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#957662" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip cursor={{ fill: "#D2E2EC" }} />
                <Legend />
                <Bar dataKey="revenue" fill="#79A3C3" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#3A2119" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
        <CardHeader>
          <CardTitle className="text-[#3A2119] font-serif">Per-Item Profitability</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#D2E2EC] border-b border-[#EBCDB7] text-[#3A2119]">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3 text-right">Selling Price</th>
                  <th className="px-6 py-3 text-right">Cost / Item</th>
                  <th className="px-6 py-3 text-right">Profit / Item</th>
                  <th className="px-6 py-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBCDB7]/50">
                {perItemData.map(({ item, costPerItem, profitPerItem, margin }) => (
                  <tr key={item.id} className="hover:bg-[#D2E2EC]/30">
                    <td className="px-6 py-3 font-medium text-[#3A2119]">{item.name}</td>
                    <td className="px-6 py-3 text-right text-[#79A3C3] font-bold">₹{Number(item.price).toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-[#3A2119]">
                      {costPerItem !== null ? `₹${costPerItem.toFixed(2)}` : <span className="text-[#957662] text-xs italic">No recipe</span>}
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      {profitPerItem !== null ? (
                        <span className={profitPerItem >= 0 ? "text-green-700" : "text-red-600"}>
                          ₹{profitPerItem.toFixed(2)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      {margin !== null ? (
                        <span className={margin >= 0 ? "text-green-700" : "text-red-600"}>
                          {margin.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
                {linkedItems.length > 0 && (
                  <tr className="bg-[#3A2119]/5 font-bold">
                    <td className="px-6 py-3 text-[#3A2119]" colSpan={4}>Average Margin (linked items)</td>
                    <td className="px-6 py-3 text-right text-[#3A2119]">{avgMargin.toFixed(1)}%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
