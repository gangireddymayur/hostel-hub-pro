import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Building2, Phone, Mail, MapPin, Database, Download, RotateCcw, ShieldCheck, AlertTriangle, FileJson, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  changePassword,
  getHostelSettings,
  updateHostelSettings,
  uploadHostelLogo,
  downloadSystemBackup,
  restoreSystemBackup,
  type SystemBackupPayload,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · GATEX" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

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

  // Backup & Restore state
  const [isDownloading, setIsDownloading] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const [parsedBackupData, setParsedBackupData] = useState<SystemBackupPayload | null>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "clean_replace">("merge");

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

  const restoreMutation = useMutation({
    mutationFn: restoreSystemBackup,
    onSuccess: (res) => {
      toast.success(res.message || "System state successfully restored!");
      setRestoreModalOpen(false);
      setSelectedBackupFile(null);
      setParsedBackupData(null);
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to restore backup"),
  });

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      logoMutation.mutate(file);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      const res = await downloadSystemBackup();
      const jsonString = JSON.stringify(res, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href = url;
      link.download = `gatex_safe_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Backup downloaded successfully! (${res.counts?.students ?? 0} students, ${res.counts?.leaveRequests ?? 0} requests)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate backup");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text) as SystemBackupPayload;
        if (!json.data || typeof json.data !== "object") {
          toast.error("Invalid backup file: Missing database payload.");
          return;
        }
        setSelectedBackupFile(file);
        setParsedBackupData(json);
        setRestoreMode("merge");
        setRestoreModalOpen(true);
      } catch (err) {
        toast.error("Malformed JSON backup file. Please select a valid GATEX backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <PageHeader title="Hostel Settings" description="Manage branding, contact information, support details, database backup, and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hostel Details Card */}
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
              <div
                className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 transition hover:bg-muted/50 overflow-hidden shadow-inner"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload logo"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Hostel logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center p-2">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">Add Logo</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                  disabled={logoMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {logoMutation.isPending ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or SVG up to 5MB. Rendered across printable PDF dossiers and gate passes.
                </p>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hostel_name" className="text-xs font-semibold">Hostel / Branch Name</Label>
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
                Official Admin Email
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

        {/* Right Column: Backup & Security Cards */}
        <div className="grid gap-6">
          {/* Data Management & System Backup Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Data Management &amp; System Backup
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  SAFE BACKUP
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Export complete snapshots of students, leaves, gate logs, and photos, or restore from an existing backup file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={restoreFileInputRef}
                type="file"
                accept=".json,.gatexbkp"
                className="hidden"
                onChange={handleSelectRestoreFile}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Download Safe Backup */}
                <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Create Safe Backup
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      Download a timestamped JSON snapshot of all records, GPS logs, and photos for offline preservation.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-sm"
                    disabled={isDownloading}
                    onClick={handleDownloadBackup}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {isDownloading ? "Generating..." : "Download Backup"}
                  </Button>
                </div>

                {/* Upload & Restore Backup */}
                <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Upload &amp; Restore
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      Restore system state or migrate database records from a previously exported backup file.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold"
                    onClick={() => restoreFileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Backup
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>All backups include cryptographic verification and pre-restore rollback safety points.</span>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
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

      {/* RESTORE CONFIRMATION DIALOG */}
      <Dialog open={restoreModalOpen} onOpenChange={setRestoreModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Restore System Backup</DialogTitle>
                <DialogDescription className="text-xs">
                  Review snapshot contents before applying changes to the live database.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {parsedBackupData && (
            <div className="space-y-3 py-2 text-xs">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <FileJson className="h-4 w-4 text-primary" />
                    {selectedBackupFile?.name || "Backup File"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {parsedBackupData.version ? `v${parsedBackupData.version}` : "GATEX JSON"}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-[11px] grid grid-cols-2 gap-1 pt-1 border-t border-border/40">
                  <div>Exported: {parsedBackupData.exported_at ? new Date(parsedBackupData.exported_at).toLocaleString() : "Unknown"}</div>
                  <div>Exported By: {parsedBackupData.exported_by || "Administrator"}</div>
                </div>
              </div>

              {/* Record Summary Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Students</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.students ?? (Array.isArray(parsedBackupData.data?.students) ? parsedBackupData.data.students.length : 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Leave Requests</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.leaveRequests ?? (Array.isArray(parsedBackupData.data?.leaveRequests) ? parsedBackupData.data.leaveRequests.length : 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Gate Passes</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.gatePasses ?? (Array.isArray(parsedBackupData.data?.gatePasses) ? parsedBackupData.data.gatePasses.length : 0)}
                  </div>
                </div>
              </div>

              {/* Restore Mode Selector */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold text-foreground">Restore Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`cursor-pointer rounded-lg border p-2.5 transition ${
                      restoreMode === "merge"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                    }`}
                    onClick={() => setRestoreMode("merge")}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${restoreMode === "merge" ? "text-primary" : "text-muted-foreground"}`} />
                      Smart Merge &amp; Upsert
                    </div>
                    <p className="mt-1 text-[10px] leading-snug">
                      (Recommended) Updates existing records &amp; adds missing ones. <strong>Never deletes</strong> newer unbacked-up students.
                    </p>
                  </div>

                  <div
                    className={`cursor-pointer rounded-lg border p-2.5 transition ${
                      restoreMode === "clean_replace"
                        ? "border-rose-500 bg-rose-500/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                    }`}
                    onClick={() => setRestoreMode("clean_replace")}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Full Replacement
                    </div>
                    <p className="mt-1 text-[10px] leading-snug">
                      Full rollback. Replaces current database to match this exact snapshot file.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                {restoreMode === "merge" ? (
                  <span>🛡️ <strong>Zero Data Loss:</strong> Smart Merge will update matching student records and insert missing ones. Any students added after this backup was created will remain completely safe.</span>
                ) : (
                  <span>⚠️ <strong>Full Rollback Warning:</strong> This will overwrite the current database state with the backup snapshot.</span>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground font-semibold"
              disabled={restoreMutation.isPending || !parsedBackupData}
              onClick={() => {
                if (parsedBackupData) {
                  restoreMutation.mutate({
                    ...parsedBackupData,
                    mode: restoreMode,
                  });
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {restoreMutation.isPending ? "Restoring..." : restoreMode === "merge" ? "Apply Smart Merge" : "Confirm Full Replace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
