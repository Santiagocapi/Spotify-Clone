import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, LogOut } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, dispatch } = useAuthContext();

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
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar canciones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
              <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive">
            <LogOut size={18} />
          </Button>
        </div>
      )}
    </header>
  );
}
