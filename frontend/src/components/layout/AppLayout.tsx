import { Link, NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Call Calendar
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Запись
            </NavLink>
            <NavLink to="/admin/event-types" className={navLinkClass}>
              Админка
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Панель владельца</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управление типами событий и просмотр предстоящих встреч.
        </p>
      </div>
      <nav className="flex gap-2 border-b pb-3">
        <NavLink to="/admin/event-types" className={navLinkClass}>
          Типы событий
        </NavLink>
        <NavLink to="/admin/bookings" className={navLinkClass}>
          Предстоящие встречи
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
