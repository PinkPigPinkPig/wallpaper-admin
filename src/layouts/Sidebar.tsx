"use client";
import { Button, ConfigProvider, Flex, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useMemo, useState } from "react";
import { IMenuItem, menus } from "@/data/paths";
import { usePathname } from "next/navigation";
import Link, { TLinkHref } from "@/components/ui/Link";
import Show from "@/components/ui/Show";
import Title from "antd/es/typography/Title";
import { useAuth } from "@/hooks/useAuth";
import {
  LogoutOutlined,
  PictureOutlined,
  FolderOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const MENU_ICONS: Record<string, React.ReactNode> = {
  "/admin/wallpaper": <PictureOutlined />,
  "/admin/category": <FolderOutlined />,
  "/admin/menu": <AppstoreOutlined />,
};

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const pathname = usePathname();
  const { logout } = useAuth();
  const defaultOpenKeys = "/" + pathname.split("/")[1];

  const pathSelected = useMemo(() => {
    const sp = pathname.split("/");
    return menus
      .map((m) => m.key)
      .filter((path) =>
        path.split("/").every((el, i) => sp[i] === el)
      );
  }, [pathname]);

  const transformedMenus = useMemo(() => {
    return menus.reduce((arr: IMenuItem[], menu) => {
      const tempMenu = { ...menu };
      if (menu.children) {
        tempMenu.children = menu.children.map((child) => ({
          ...child,
          icon: MENU_ICONS[child.key] || undefined,
          label: <Link href={child.key as TLinkHref}>{child.label}</Link>,
        }));
      } else {
        tempMenu.icon = MENU_ICONS[menu.key] || undefined;
        tempMenu.label = <Link href={menu.key as TLinkHref}>{menu.label}</Link>;
      }
      return arr.concat(tempMenu);
    }, []);
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: "rgba(52, 55, 179, 0.15)",
            itemSelectedColor: "#fff",
            itemHoverBg: "rgba(52, 55, 179, 0.08)",
          },
        },
      }}
    >
      <div className="max-w-66">
        <Sider
          className="min-h-screen h-full sticky left-0 top-0 z-20 flex flex-col"
          collapsed={collapsed}
          onCollapse={(v) => setCollapsed(v)}
          width={264}
          style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)" }}
        >
          {/* Logo */}
          <Flex
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            gap={12}
            style={{
              padding: collapsed ? "20px 0" : "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Flex
              align="center"
              justify="center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(52, 55, 179, 0.6)",
                flexShrink: 0,
              }}
            >
              <PictureOutlined style={{ fontSize: 18, color: "#fff" }} />
            </Flex>
            {!collapsed && (
              <Title
                level={5}
                style={{ margin: 0, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Wallpaper Admin
              </Title>
            )}
          </Flex>

          <Show when={pathSelected.length && transformedMenus.length}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={pathSelected}
              openKeys={openKeys}
              onOpenChange={(keys) => {
                const latest = keys.find((k) => !openKeys.includes(k));
                setOpenKeys(latest ? [latest] : []);
                if (!openKeys.length) setOpenKeys([defaultOpenKeys]);
              }}
              defaultOpenKeys={[defaultOpenKeys]}
              items={transformedMenus}
              className="w-full flex-1"
              style={{ background: "transparent", border: "none" }}
            />
          </Show>

          <div
            style={{
              padding: "16px 12px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              className="logout-btn"
              style={{
                width: "100%",
                color: "rgba(255,255,255,0.65)",
                justifyContent: collapsed ? "center" : "flex-start",
                paddingInline: collapsed ? 0 : 16,
              }}
            >
              {!collapsed && "Logout"}
            </Button>
          </div>
        </Sider>
      </div>
      <style jsx global>{`
        .logout-btn:hover {
          color: #ff4d4f !important;
          background: rgba(255, 77, 79, 0.1) !important;
        }
      `}</style>
    </ConfigProvider>
  );
}

export default Sidebar;
