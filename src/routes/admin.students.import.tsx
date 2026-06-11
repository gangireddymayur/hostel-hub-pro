import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { importStudents } from "@/lib/api";

export const Route = createFileRoute("/admin/students/import")({
  head: () => ({ meta: [{ title: "Import Students · HostelOS" }] }),
  component: ImportPage,
});

function ImportPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: async (data) => {
      toast.success(`Imported ${data.data.imported} students`);
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: ["hostel-students"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Import failed"),
  });

  return (
    <>
      <PageHeader title="Import students" description="Bulk upload students from an Excel file." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Upload file</CardTitle></CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary/40 hover:bg-accent/30">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{file ? file.name : "Click to choose .xlsx file"}</p>
              <p className="mt-1 text-xs text-muted-foreground">or drag and drop here</p>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>

            <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Expected columns</p>
              Student ID · Student Name · Room Number · Student Mobile · Parent Mobile
            </div>

            <Button
              className="mt-4 w-full"
              disabled={!file || importMutation.isPending}
              onClick={() => {
                if (!file) return;
                importMutation.mutate(file);
              }}
            >
              <Upload className="h-4 w-4" /> Import students
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Import notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The backend will create new student records or update existing ones based on hostel + student ID.</p>
            <p>Default password for imported students is set on the server to the reset password policy.</p>
            <p>After import, the student list refreshes automatically.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
