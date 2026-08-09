import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { FileSpreadsheet, Download, Upload } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-DzXaAUvU.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Bo6P4ZFC.mjs";
import { A as importStudents, B as Button } from "./api-BV4qQJW2.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-DotLh9tP.mjs";
import "@radix-ui/react-avatar";
import "clsx";
import "tailwind-merge";
function ImportPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const importMutation = useMutation({
    mutationFn: importStudents,
    onSuccess: async (data) => {
      toast.success(`Imported ${data.data.imported} students`);
      setFile(null);
      await queryClient.invalidateQueries({
        queryKey: ["hostel-students"]
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Import failed")
  });
  const downloadTemplate = () => {
    const headers = ["Student ID", "Student Name", "Room Number", "Student Mobile", "Parent Mobile", "Student Year", "Hostel Name", "Student Password", "Parent Password"];
    const sampleRow = ["21N81A66G4", "Mayur", "Room 12", "6281192139", "9908006588", "1st Year", "hosteltest", "Student@12345", "Parent@12345"];
    const csvRows = [headers.map((h) => `"${h}"`).join(","), sampleRow.map((r) => `"${r}"`).join(",")];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Import students", description: "Bulk upload students from an Excel or CSV file." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Upload file" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary/40 hover:bg-accent/30", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-10 w-10 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium", children: file ? file.name : "Click to choose template file" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or drag and drop here" }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: ".xlsx,.xls,.csv", className: "hidden", onChange: (e) => setFile(e.target.files?.[0] ?? null) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: "Expected columns" }),
            "Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year · Hostel Name · Student Password · Parent Password"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "mt-3 w-full border-primary/20 hover:bg-primary/5 text-primary hover:text-primary", onClick: downloadTemplate, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
            " Download CSV Template"
          ] }),
          /* @__PURE__ */ jsxs(Button, { className: "mt-3 w-full", disabled: !file || importMutation.isPending, onClick: () => {
            if (!file) return;
            importMutation.mutate(file);
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            " Import students"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Import Notes & Guidelines" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4 text-sm text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Branch Routing (Hostel Name):" }),
            " You can specify which hostel branch each student belongs to by entering the hostel's name (e.g. ",
            /* @__PURE__ */ jsx("em", { children: "hosteltest" }),
            ") in the ",
            /* @__PURE__ */ jsx("em", { children: "Hostel Name" }),
            " column. If left blank, students will default to your primary hostel branch."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mandatory Columns:" }),
            " ",
            /* @__PURE__ */ jsx("em", { children: "Student ID" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Student Name" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Room Number" }),
            ", ",
            /* @__PURE__ */ jsx("em", { children: "Student Mobile" }),
            ", and ",
            /* @__PURE__ */ jsx("em", { children: "Parent Mobile" }),
            " are strictly required for every student row. Rows missing any of these values will be automatically skipped."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: "User Account Passwords:" }),
            " You can optionally supply custom passwords for the student and parent in the ",
            /* @__PURE__ */ jsx("em", { children: "Student Password" }),
            " and ",
            /* @__PURE__ */ jsx("em", { children: "Parent Password" }),
            " columns. If left empty, they default to ",
            /* @__PURE__ */ jsx("em", { children: "Student@12345" }),
            " and ",
            /* @__PURE__ */ jsx("em", { children: "Parent@12345" }),
            " respectively."
          ] }),
          /* @__PURE__ */ jsx("p", { children: "The import system automatically detects duplicates and updates existing student records using the unique combination of hostel and student ID." }),
          /* @__PURE__ */ jsxs("p", { className: "font-medium text-foreground/80", children: [
            "💡 Tip: Click the ",
            /* @__PURE__ */ jsx("strong", { children: "Download CSV Template" }),
            " button on the left to get a pre-formatted spreadsheet you can open directly in Excel!"
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ImportPage as component
};
