"use client";
import { Menu, Button } from "antd";
import Sider from "antd/es/layout/Sider";
import { useMemo, useState } from "react";
import { IMenuItem, menus } from "@/data/paths";
import { usePathname } from "next/navigation";
import Link, {
  TLinkHref,
} from "@/components/ui/Link";
import Show from "@/components/ui/Show";
import Title from "antd/es/typography/Title";
import { useAuth } from "@/hooks/useAuth";
import { LogoutOutlined } from "@ant-design/icons";

function Sidebar() {
  const [collapsed, setCollapsed] =
    useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  const splitPathname = pathname.split("/");
  const defaultOpenKeys = splitPathname
    ? "/" + splitPathname[1]
    : "";

  const transformedMenus = useMemo(() => {
    return menus.reduce(
      (arr: IMenuItem[], menu) => {
        const tempMenu = { ...menu };

        if (menu.children) {
          tempMenu.children = menu.children.map(
            (child) => ({
              ...child,
              label: (
                <Link
                  href={child.key as TLinkHref}
                >
                  {child.label}
                </Link>
              ),
            })
          );
        } else {
          tempMenu.label = (
            <Link
              href={tempMenu.key as TLinkHref}
            >
              {tempMenu.label}
            </Link>
          );
        }

        return arr.concat(tempMenu);
      },
      []
    );
  }, []);

  const allPaths = useMemo(() => {
    return menus.map((menu) => menu.key);
  }, []);

  const pathSelected = allPaths.filter((path) => {
    return path.split("/").every((el, index) => {
      return splitPathname[index] === el;
    });
  });

  const [openKeys, setOpenKeys] = useState<
    string[]
  >([defaultOpenKeys]);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(
      (key) => !openKeys.includes(key)
    );
    setOpenKeys(
      latestOpenKey ? [latestOpenKey] : []
    );
  };

  return (
    <div className="max-w-66">
      <Sider
        className="min-h-screen h-full sticky left-0 top-0 z-20 flex flex-col"
        collapsed={collapsed}
        onCollapse={(value) =>
          setCollapsed(value)
        }
        width={264}
      >
        <Title level={4} className="mt-4 text-center !text-white">
          Wallpaper Admin
        </Title>
        <Show
          when={
            pathSelected.length &&
            transformedMenus.length
          }
        >
          <Menu
            theme="dark"
            defaultOpenKeys={[
              pathSelected[0] ?? "",
            ]}
            defaultSelectedKeys={[
              "/admin/wallpaper",
            ]}
            mode="inline"
            selectedKeys={[...pathSelected]}
            items={transformedMenus}
            className="w-full flex-1"
            openKeys={openKeys}
            onOpenChange={onOpenChange}
          />
        </Show>
        <div className="p-4 border-t border-gray-600">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            className="w-full text-white hover:text-red-400"
            size="large"
          >
            {!collapsed && "Logout"}
          </Button>
        </div>
      </Sider>
    </div>
  );
}

export default Sidebar;
