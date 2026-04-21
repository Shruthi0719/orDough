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
  LogOut
} from "lucide-react";
import { adminAuthQueryKey, logoutAdmin } from "@/lib/auth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-[#EBCDB7] flex font-sans text-[#3A2119]">
      <aside className="w-64 bg-[#3A2119] text-[#EBCDB7] flex flex-col border-r border-[#957662] shrink-0">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#957662] text-[#D2E2EC]" 
                    : "text-[#EBCDB7]/70 hover:bg-[#957662]/50 hover:text-[#EBCDB7]"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#D2E2EC]" : "text-[#EBCDB7]/50"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-[#957662]">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-[#EBCDB7]/70 hover:bg-[#957662]/50 hover:text-[#EBCDB7] transition-colors"
          >
            <LogOut size={18} className="text-[#EBCDB7]/50" />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-[#EBCDB7] flex items-center justify-between px-8 shrink-0">
          <h1 className="font-serif text-xl text-[#3A2119]">
            {navItems.find(item => location === item.href || (item.href !== "/admin" && location.startsWith(item.href)))?.label || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-8 h-8 rounded-full bg-[#D2E2EC] flex items-center justify-center text-[#3A2119] font-medium border border-[#79A3C3]">
              OD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
