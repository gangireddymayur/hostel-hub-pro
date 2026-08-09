import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
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

  const downloadTemplate = () => {
    const headers = [
      "Student ID",
      "Student Name",
      "Room Number",
      "Student Mobile",
      "Parent Mobile",
      "Student Year",
      "Hostel Name",
      "Student Password",
      "Parent Password"
    ];
    const sampleRow = [
      "21N81A66G4",
      "Mayur",
      "Room 12",
      "6281192139",
      "9908006588",
      "1st Year",
      "hosteltest",
      "Student@12345",
      "Parent@12345"
    ];
    
    // Format rows correctly with CSV quotes to handle spaces
    const csvRows = [
      headers.map(h => `"${h}"`).join(","),
      sampleRow.map(r => `"${r}"`).join(",")
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageHeader title="Import students" description="Bulk upload students from an Excel or CSV file." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Upload file</CardTitle></CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary/40 hover:bg-accent/30">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{file ? file.name : "Click to choose template file"}</p>
              <p className="mt-1 text-xs text-muted-foreground">or drag and drop here</p>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>

            <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Expected columns</p>
              Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password
            </div>

            <Button
              variant="outline"
              className="mt-3 w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" /> Download CSV Template
            </Button>

            <Button
              className="mt-3 w-full"
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
            <CardTitle>Import Notes & Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>Branch Routing (Hostel Name):</strong> You can specify which hostel branch each student belongs to by entering the hostel's name (e.g. <em>hosteltest</em>) in the <em>Hostel Name</em> column. If left blank, students will default to your primary hostel branch.
            </p>
            <p>
              <strong>Mandatory Columns:</strong> <em>Student ID</em>, <em>Student Name</em>, <em>Room Number</em>, <em>Student Mobile</em>, and <em>Parent Mobile</em> are strictly required for every student row. Rows missing any of these values will be automatically skipped.
            </p>
            <p>
              <strong>User Account Passwords:</strong> You can optionally supply custom passwords for the student and parent in the <em>Student Password</em> and <em>Parent Password</em> columns. If left empty, they default to <em>Student@12345</em> and <em>Parent@12345</em> respectively.
            </p>
            <p>
              The import system automatically detects duplicates and updates existing student records using the unique combination of hostel and student ID.
            </p>
            <p className="font-medium text-foreground/80">
              💡 Tip: Click the <strong>Download CSV Template</strong> button on the left to get a pre-formatted spreadsheet you can open directly in Excel!
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
