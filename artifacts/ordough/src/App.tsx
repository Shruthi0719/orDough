import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import Home from "@/pages/Home";
import Dashboard from "@/pages/admin/Dashboard";
import Orders from "@/pages/admin/Orders";
import Menu from "@/pages/admin/Menu";
import Customers from "@/pages/admin/Customers";
import Ingredients from "@/pages/admin/Ingredients";
import Recipes from "@/pages/admin/Recipes";
import Reviews from "@/pages/admin/Reviews";
import Profit from "@/pages/admin/Profit";
import Settings from "@/pages/admin/Settings";
import Invoice from "@/pages/admin/Invoice";
import AdminLogin from "@/pages/admin/Login";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedAdmin } from "@/components/auth/ProtectedAdmin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/invoice/:id">
        <ProtectedAdmin>
          <Invoice />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin">
        <ProtectedAdmin>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/orders">
        <ProtectedAdmin>
          <AdminLayout>
            <Orders />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/menu">
        <ProtectedAdmin>
          <AdminLayout>
            <Menu />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/customers">
        <ProtectedAdmin>
          <AdminLayout>
            <Customers />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/ingredients">
        <ProtectedAdmin>
          <AdminLayout>
            <Ingredients />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/recipes">
        <ProtectedAdmin>
          <AdminLayout>
            <Recipes />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/reviews">
        <ProtectedAdmin>
          <AdminLayout>
            <Reviews />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/profit">
        <ProtectedAdmin>
          <AdminLayout>
            <Profit />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/settings">
        <ProtectedAdmin>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedAdmin>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SonnerToaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
