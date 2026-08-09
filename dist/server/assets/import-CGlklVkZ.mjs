import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { FileSpreadsheet, Upload } from "lucide-react";
import { P as PageHeader } from "./dashboard-shell-wIEew92i.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-DZDs0iFR.mjs";
import { A as importStudents, B as Button } from "./api-awou-MCe.mjs";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tooltip";
import "./router-D-xQeDON.mjs";
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Import students", description: "Bulk upload students from an Excel file." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-1", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Upload file" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary/40 hover:bg-accent/30", children: [
            /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-10 w-10 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm font-medium", children: file ? file.name : "Click to choose .xlsx file" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "or drag and drop here" }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: ".xlsx,.xls,.csv", className: "hidden", onChange: (e) => setFile(e.target.files?.[0] ?? null) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 font-medium text-foreground", children: "Expected columns" }),
            "Student ID · Student Name · Room Number · Student Mobile · Parent Mobile · Student Year"
          ] }),
          /* @__PURE__ */ jsxs(Button, { className: "mt-4 w-full", disabled: !file || importMutation.isPending, onClick: () => {
            if (!file) return;
            importMutation.mutate(file);
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
            " Import students"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Import notes" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("p", { children: "The backend will create new student records or update existing ones based on hostel + student ID." }),
          /* @__PURE__ */ jsx("p", { children: "Default password for imported students is set on the server to the reset password policy." }),
          /* @__PURE__ */ jsx("p", { children: "After import, the student list refreshes automatically." })
        ] })
      ] })
    ] })
  ] });
}
export {
  ImportPage as component
};
