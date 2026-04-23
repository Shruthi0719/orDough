import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Package,
  BookOpen,
  Star,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { adminAuthQueryKey, logoutAdmin } from "@/lib/auth";
import { useAdminTheme } from "@/hooks/use-admin-theme";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { isDark, toggle } = useAdminTheme();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/ingredients", label: "Ingredients", icon: Package },
    { href: "/admin/recipes", label: "Recipes", icon: BookOpen },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/profit", label: "Profit", icon: LineChart },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logoutAdmin();
    queryClient.removeQueries({ queryKey: adminAuthQueryKey });
    setLocation("/admin/login");
  };

  const bg = isDark ? "bg-[#0a0402]" : "bg-[#EBCDB7]";
  const sidebar = isDark ? "bg-[#0a0402] border-[#3A2119]" : "bg-[#3A2119] border-[#957662]";
  const headerBg = isDark ? "bg-[#0a0402] border-[#3A2119]" : "bg-[#EBCDB7] border-[#EBCDB7]";
  const headerText = isDark ? "text-[#EBCDB7]" : "text-[#3A2119]";
  const activeLink = isDark
    ? "bg-[#3A2119] text-[#D2E2EC] border-l-2 border-[#79A3C3]"
    : "bg-[#957662] text-[#D2E2EC] border-l-2 border-[#79A3C3]";
  const inactiveLink = isDark
    ? "text-[#EBCDB7]/50 hover:bg-[#3A2119]/60 hover:text-[#EBCDB7]"
    : "text-[#EBCDB7]/70 hover:bg-[#957662]/50 hover:text-[#EBCDB7]";

  return (
    <div
      className={`min-h-screen ${bg} flex font-sans ${isDark ? "text-[#EBCDB7]" : "text-[#3A2119]"}`}
      style={{ colorScheme: isDark ? "dark" : "light" }}
      data-theme={isDark ? "dark" : "light"}
    >
      <aside className={`w-64 ${sidebar} text-[#EBCDB7] flex flex-col border-r shrink-0`}>
        <div className="p-6">
          <Link href="/" className="font-serif text-2xl tracking-wide flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="opacity-90">🍪</span> orDough
          </Link>
          <p className="text-[#D2E2EC] text-xs font-serif italic mt-1 pl-8">Admin POS</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? activeLink : inactiveLink}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-[#957662]">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium ${inactiveLink} transition-colors`}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden cursor-auto">
        <header className={`h-16 ${headerBg} border-b flex items-center justify-between px-8 shrink-0`}>
          <h1 className={`font-serif text-xl ${headerText}`}>
            {navItems.find((item) => location === item.href || (item.href !== "/admin" && location.startsWith(item.href)))?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                isDark
                  ? "bg-[#3A2119] border-[#957662] text-[#EBCDB7] hover:bg-[#957662]"
                  : "bg-[#D2E2EC] border-[#957662]/40 text-[#3A2119] hover:bg-[#79A3C3]/20"
              }`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border ${
              isDark ? "bg-[#3A2119] text-[#EBCDB7] border-[#79A3C3]" : "bg-[#D2E2EC] text-[#3A2119] border-[#79A3C3]"
            }`}>
              OD
            </div>
          </div>
        </header>
        <div className={`flex-1 overflow-auto p-8 ${isDark ? "bg-[#0f0806]" : "bg-[#D2E2EC]/40"}`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
