import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { changePassword, getHostelSettings, updateHostelSettings, uploadHostelLogo } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · GATEX" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["hostel-settings"],
    queryFn: getHostelSettings,
  });

  const hostel = settingsData?.data;

  const [hostelName, setHostelName] = useState("");
  const [hostelEmail, setHostelEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hostel) {
      setHostelName(hostel.hostel_name || "");
      setHostelEmail(hostel.email || "");
      setPhone(hostel.phone || "");
      setAddress(hostel.address || "");
      setLogoUrl(hostel.logo || null);
    }
  }, [hostel]);

  const updateMutation = useMutation({
    mutationFn: updateHostelSettings,
    onSuccess: (res) => {
      toast.success("Hostel details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["hostel-settings"] });
      if (res.data) {
        setHostelName(res.data.hostel_name || "");
        setHostelEmail(res.data.email || "");
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
        setLogoUrl(res.data.logo || null);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update hostel details"),
  });

  const logoMutation = useMutation({
    mutationFn: uploadHostelLogo,
    onSuccess: (res) => {
      toast.success("Hostel logo uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["hostel-settings"] });
      if (res.data?.logo) {
        setLogoUrl(res.data.logo);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to upload logo"),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password"),
  });

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoMutation.mutate(file);
    }
  };

  return (
    <>
      <PageHeader title="Hostel Settings" description="Manage branding, contact information, support details, and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Hostel Details & Support Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoFileChange}
              />
              <div className="relative flex h-16 w-16 overflow-hidden items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-xl font-bold text-primary shadow-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt="Hostel Logo" className="h-full w-full object-cover" />
                ) : (
                  (hostelName || "HA").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={logoMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  {logoMutation.isPending ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-[11px] text-muted-foreground">PNG, JPG, or SVG for branding and student app header.</p>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hostel_name" className="text-xs font-semibold">Hostel Name</Label>
              <Input
                id="hostel_name"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="e.g. TechnoTrade Men's Hostel"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hostel_email" className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Support & Contact Email
              </Label>
              <Input
                id="hostel_email"
                type="email"
                value={hostelEmail}
                onChange={(e) => setHostelEmail(e.target.value)}
                placeholder="e.g. admin@technotrade.com"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hostel_phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Contact Phone / Helpline Number
              </Label>
              <Input
                id="hostel_phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210 / 040-23456789"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hostel_address" className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Campus Address / Location
              </Label>
              <Textarea
                id="hostel_address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete hostel address, block number, and landmarks..."
              />
            </div>

            <Button
              className="w-fit font-semibold"
              disabled={isLoading || updateMutation.isPending}
              onClick={() => {
                updateMutation.mutate({
                  hostel_name: hostelName,
                  email: hostelEmail,
                  phone,
                  address,
                });
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  passwordMutation.mutate({
                    currentPassword: String(form.get("currentPassword") ?? ""),
                    newPassword: String(form.get("newPassword") ?? ""),
                  });
                }}
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" name="newPassword" type="password" required />
                </div>
                <Button className="w-fit font-semibold" type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

