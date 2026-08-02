import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/devices", label: "Devices" },
  { to: "/map", label: "Live Map" },
  { to: "/pending-approvals", label: "Pending Approvals" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
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
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}