import { useEffect, useState } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    bakeryName: "", tagline: "", phone: "", address: "", upiId: "", whatsapp: "", currency: "", taxRate: 0
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        bakeryName: settings.bakeryName,
        tagline: settings.tagline,
        phone: settings.phone || "",
        address: settings.address || "",
        upiId: settings.upiId || "",
        whatsapp: settings.whatsapp || "",
        currency: settings.currency,
        taxRate: settings.taxRate
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update settings", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Bakery Settings</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="admin-card bg-[#EBCDB7] border-[#957662]/30">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-[#3A2119]">General Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bakery Name</Label>
                <Input value={formData.bakeryName} onChange={e => setFormData({...formData, bakeryName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>UPI ID (Payment)</Label>
                <Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" step="0.1" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})} />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="bg-[#3A2119] text-white hover:bg-[#3A2119]">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
