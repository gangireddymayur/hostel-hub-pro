import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FileJson,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  changePassword,
  downloadSystemBackup,
  restoreSystemBackup,
  type SystemBackupPayload,
} from "@/lib/api";
import { getSession } from "@/lib/role";
import { toast } from "sonner";

export const Route = createFileRoute("/super/settings")({
  head: () => ({ meta: [{ title: "Settings · GATEX" }] }),
  component: SuperSettings,
});

function SuperSettings() {
  const session = getSession();
  const queryClient = useQueryClient();
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const [parsedBackupData, setParsedBackupData] = useState<SystemBackupPayload | null>(null);

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success("Password updated"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update password"),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreSystemBackup,
    onSuccess: (res) => {
      toast.success(res.message || "Global system state successfully restored!");
      setRestoreModalOpen(false);
      setSelectedBackupFile(null);
      setParsedBackupData(null);
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to restore backup"),
  });

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
      link.download = `gatex_master_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Master backup downloaded! (${res.counts?.hostels ?? 0} hostels, ${res.counts?.students ?? 0} students)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate master backup");
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
      <PageHeader title="Platform settings" description="Configure your GATEX workspace, system backups, and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          {/* Account Card */}
          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5"><Label>Signed in as</Label><Input value={session?.profile.email ?? ""} readOnly /></div>
              <div className="grid gap-1.5"><Label>Role</Label><Input value={session?.profile.role ?? ""} readOnly /></div>
            </CardContent>
          </Card>

          {/* Master Backup Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Master Database Backup &amp; Restore
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  SUPER ADMIN
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Generate complete multi-hostel database snapshots or restore platform state.
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
                <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Create Master Backup
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      Download complete snapshot of all hostels, students, gate passes, GPS logs, and audit trails.
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

                <div className="rounded-xl border border-border/70 bg-card p-3.5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      Upload &amp; Restore
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                      Restore platform data or migrate full database from a previously exported JSON backup.
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
                <span>Encrypted schema check and automatic rollback snapshot created on every restore.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {/* Notifications Card */}
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              {[
                ["New hostel onboarded", "Send email when a new hostel signs up."],
                ["Subscription expiring", "Notify 7 days before subscription ends."],
                ["Weekly summary", "Receive a weekly performance digest."],
              ].map(([title, description]) => (
                <div key={title} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
            <CardContent>
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
                <Button className="w-fit" type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? "Updating..." : "Update password"}
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
                <DialogTitle className="text-base font-bold">Restore Master Backup</DialogTitle>
                <DialogDescription className="text-xs">
                  Review platform snapshot contents before applying changes to the live database.
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
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Hostels</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.hostels ?? (Array.isArray(parsedBackupData.data?.hostels) ? parsedBackupData.data.hostels.length : 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Students</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.students ?? (Array.isArray(parsedBackupData.data?.students) ? parsedBackupData.data.students.length : 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Requests</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.leaveRequests ?? (Array.isArray(parsedBackupData.data?.leaveRequests) ? parsedBackupData.data.leaveRequests.length : 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border/60 bg-card p-2 text-center">
                  <div className="text-[10px] text-muted-foreground font-medium">Passes</div>
                  <div className="text-base font-bold text-foreground mt-0.5">
                    {parsedBackupData.counts?.gatePasses ?? (Array.isArray(parsedBackupData.data?.gatePasses) ? parsedBackupData.data.gatePasses.length : 0)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                ⚠️ <strong>Safety Notice:</strong> Restoring this backup will replace current database tables with records from this backup snapshot.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setRestoreModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700 font-semibold"
              disabled={restoreMutation.isPending || !parsedBackupData}
              onClick={() => {
                if (parsedBackupData) {
                  restoreMutation.mutate(parsedBackupData as any);
                }
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {restoreMutation.isPending ? "Restoring Platform..." : "Confirm & Apply Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
