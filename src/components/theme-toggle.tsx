import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTheme, setTheme } from "@/lib/role";

export function ThemeToggle() {
  const [theme, setT] = useState<"light" | "dark">("light");
  useEffect(() => setT(getTheme()), []);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next); setT(next);
      }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
