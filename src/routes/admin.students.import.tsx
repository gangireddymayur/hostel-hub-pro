import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students/import")({
  head: () => ({ meta: [{ title: "Import Students · HostelOS" }] }),
  component: ImportPage,
});

const preview = [
  { id: "STU2001", name: "Aarav Patel", room: "R-101", mobile: "+91 9845011223", parent: "+91 9844012345", error: "" },
  { id: "STU2002", name: "Ishita Rao", room: "R-102", mobile: "+91 9845011224", parent: "+91 9844012346", error: "" },
  { id: "STU2003", name: "Karan Mehta", room: "", mobile: "+91 9845011225", parent: "+91 9844012347", error: "Room number missing" },
  { id: "STU2004", name: "Sneha Reddy", room: "R-103", mobile: "98450", parent: "+91 9844012348", error: "Invalid mobile" },
  { id: "STU2005", name: "Rohan Kapoor", room: "R-104", mobile: "+91 9845011227", parent: "+91 9844012349", error: "" },
];

function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const valid = preview.filter(p => !p.error).length;
  const errors = preview.length - valid;

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

            <Button className="mt-4 w-full" onClick={() => toast.success(`${valid} students imported`)}><Upload className="h-4 w-4" /> Import {valid} valid rows</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview</span>
              <div className="flex gap-2 text-xs">
                <Badge className="bg-success text-success-foreground hover:bg-success"><CheckCircle2 className="mr-1 h-3 w-3" />{valid} valid</Badge>
                <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />{errors} errors</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Room</TableHead>
                    <TableHead>Mobile</TableHead><TableHead>Parent</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map(r => (
                    <TableRow key={r.id} className={r.error ? "bg-destructive/5" : ""}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.room || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.mobile}</TableCell>
                      <TableCell className="font-mono text-xs">{r.parent}</TableCell>
                      <TableCell>{r.error
                        ? <Badge variant="destructive" className="text-[10px]">{r.error}</Badge>
                        : <Badge className="bg-success text-success-foreground hover:bg-success text-[10px]">OK</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
