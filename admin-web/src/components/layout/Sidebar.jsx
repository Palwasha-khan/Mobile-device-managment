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
    <nav>
      <h2>MDM Admin</h2>
      <ul>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              style={({ isActive }) => ({
                fontWeight: isActive ? "bold" : "normal",
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}