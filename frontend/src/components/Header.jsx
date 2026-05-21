import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, LogOut, Sun, Moon } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 sticky top-0 z-40 transition-colors duration-300">
      <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="Buscar canciones, artistas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 rounded-full bg-background/50 border-border hover:bg-background/80 focus-visible:ring-primary focus-visible:bg-background transition-all duration-300 w-full"
        />
      </form>

      <div className="flex items-center gap-4">
        {/* Theme Switcher Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
          title={theme === "light" ? "Modo oscuro" : "Modo claro"}
        >
          {theme === "light" ? (
            <Moon size={18} className="transition-transform rotate-0 scale-100 dark:-rotate-90 dark:scale-0 duration-300" />
          ) : (
            <Sun size={18} className="transition-transform rotate-90 scale-0 dark:rotate-0 dark:scale-100 duration-300 text-yellow-500" />
          )}
        </Button>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-muted/30 hover:bg-muted/60 pl-2 pr-3 py-1 rounded-full border border-border/40 transition-colors cursor-pointer">
              <Avatar className="h-7 w-7 ring-2 ring-primary/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold tracking-wide text-foreground truncate max-w-[120px] hidden sm:inline-block">
                {user.email.split("@")[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 active:scale-95 rounded-full transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
