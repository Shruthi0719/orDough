import { useGetProfitReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Profit() {
  const { data: report, isLoading } = useGetProfitReport();

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Profitability Report</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Total Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-[#3A2119]">₹{safeReport.totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Total Cost</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-red-700">₹{safeReport.totalCost.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Gross Profit</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-green-700">₹{safeReport.grossProfit.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-[#3A2119]/70">Profit Margin</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-price font-bold text-[#3A2119]">{safeReport.profitMargin.toFixed(1)}%</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#3A2119] font-serif">Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeReport.byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBCDB7" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip cursor={{ fill: '#D2E2EC' }} />
                <Bar dataKey="revenue" fill="#3A2119" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#3A2119] font-serif">Profit by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeReport.byCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBCDB7" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip cursor={{ fill: '#D2E2EC' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#79A3C3" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#3A2119" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
