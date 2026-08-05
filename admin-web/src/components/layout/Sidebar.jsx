import { NavLink } from "react-router-dom";
import { usePendingCount } from "../../hooks/usePendingCount";



export default function Sidebar() {

  const { data: pendingCount = 0 } = usePendingCount();

  const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/devices", label: "Devices" },
  { to: "/map", label: "Live Map" },
  { to: "/pending-approvals", label: "Pending Approvals",badge: pendingCount },
  { to: "/settings", label: "Settings" },
];

  return (
    <nav className="h-full flex flex-col bg-white border-r border-slate-200 px-4 py-6">
      <h2 className="text-lg font-bold text-slate-900 mb-8 px-2">MDM Admin</h2>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <span>{item.label}</span>
 
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold m-3 px-2 py-0.5 rounded-full animate-pulse">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}