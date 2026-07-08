import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/draft-prep", label: "Prep", icon: "📅" },
  { to: "/standings", label: "League", icon: "🧑‍🤝‍🧑" },
  { to: "/matchups", label: "Matchups", icon: "📈" },
  { to: "/profile", label: "Profile", icon: "👤" },
] as const;

export default function BottomNav() {
  return (
    <nav
      className="nav-pill fixed bottom-4 flex items-center justify-around z-50"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: "calc(448px - 40px)",
        height: "64px",
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/dashboard"}
          className={({ isActive }) =>
            `w-[38px] h-[38px] rounded-full flex items-center justify-center text-[16px] no-underline transition-colors ${
              isActive
                ? "bg-gold-500 text-ink-900"
                : "text-ink-200"
            }`
          }
          title={item.label}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
}
