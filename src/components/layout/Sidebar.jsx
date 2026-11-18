import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Ruler,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "../ui/BrandLogo";
import Button from "../ui/Button";
import { useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
const menuItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Banner", to: "/banner", icon: Tags },
  { label: "Brand", to: "/brand", icon: Badge },
  { label: "Color", to: "/color", icon: Palette },
  { label: "Size", to: "/size", icon: Ruler },
  { label: "Category", to: "/category", icon: Tags },
  { label: "Products", to: "/products", icon: Package },
  { label: "Orders", to: "/orders", icon: ShoppingBag },
  { label: "Customers", to: "/customers", icon: Users },

  {
    label: "Setting",
    to: "/settings",
    icon: Settings,
    children: [
      { label: "Stock Movement", to: "/stock-movement", icon: Package },
      { label: "Delivery", to: "/settings/delivery", icon: Truck },
      { label: "User & Role", to: "/user-role", icon: ShieldCheck },
    ],
  },
];

export default function Sidebar({
  isOpen = false,
  isCollapsed = false,
  onClose,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  // const settingsActive =
  //   pathname === "/settings" || pathname.startsWith("/settings/");
  // const [settingsMenu, setSettingsMenu] = useState(null);
  // Open Settings on its routes; allow the user to toggle it on the current page.
  // const settingsOpen =
  //   settingsMenu?.pathname === pathname ? settingsMenu.open : settingsActive;
  const [logOut, setLogOut] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (logOut) return;
    setLogOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      onClose?.();
      navigate("/login", { replace: true });
      setLogOut(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#03152B]/50 transition lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col bg-[#1E2B3F] text-white shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
      >
        <div className="relative flex h-[76px] items-center justify-center px-5">
          <BrandLogo size="md" shoesClassName="text-white" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 rounded-lg p-2 text-[#8FA2BD] hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;

            // Group links stay expanded on their routes, with a manual toggle.
            if (item.children) {
              const active =
                pathname === item.to || pathname.startsWith(item.to + "/");
              const open =
                expandedMenu?.pathname === pathname &&
                expandedMenu?.to === item.to
                  ? expandedMenu.open
                  : active;
              const submenuId = item.label.toLowerCase() + "-submenu";
              return (
                <div key={item.to}>
                  <Button
                    variant="plain"
                    onClick={() =>
                      setExpandedMenu({ pathname, to: item.to, open: !open })
                    }
                    aria-expanded={open}
                    aria-controls={submenuId}
                    className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-md font-medium transition ${
                      active
                        ? "bg-[#F97316] text-white"
                        : "text-[#8FA2BD] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                  </Button>
                  <div
                    id={submenuId}
                    hidden={!open}
                    className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3"
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                              isActive
                                ? "bg-[#F97316] text-white"
                                : "text-[#8FA2BD] hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          <ChildIcon size={16} />
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-md font-medium transition ${
                    isActive
                      ? "bg-[#F97316] text-white shadow-sm"
                      : "text-[#8FA2BD] hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-1 pb-6 border-white/5 p-3">
          {/* <Button
            variant="plain"
            onClick={() => setSettingsMenu({ pathname, open: !settingsOpen })}
            aria-expanded={settingsOpen}
            aria-controls="settings-submenu"
            className={`flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-md font-medium transition ${
              settingsActive
                ? "bg-[#F97316] text-white"
                : "text-[#8FA2BD] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={17} />
            Settings
            <ChevronDown
              size={16}
              className={`ml-auto transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
            />
          </Button> */}
          <div
            id="settings-submenu"
            // hidden={!settingsOpen}
            className="ml-5 border-l border-white/10 pl-3"
          >
            {/* <NavLink
              to="/settings/delivery"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#F97316] text-white"
                    : "text-[#8FA2BD] hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Truck size={16} />
              Delivery
            </NavLink> */}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-md font-medium text-[#ffffff] transition cursor-pointer bg-[#fa7110] hover:bg-[#d75f09] "
          >
            <LogOut size={17} />
            {logOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
