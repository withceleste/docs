"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  tree: PageTree.Root;
}

export function Sidebar({ tree }: SidebarProps) {
  return (
    <aside className="w-64 border-r p-4">
      <nav>
        <SidebarList items={tree.children} />
      </nav>
    </aside>
  );
}

function SidebarList({ items }: { items: PageTree.Node[] }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        if (item.type === "page") {
          const isActive = pathname === item.url;
          return (
            <li key={item.url}>
              <Link
                href={item.url}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        }

        if (item.type === "folder") {
          return (
            <SidebarFolder
              key={String(item.name)}
              item={item}
              pathname={pathname}
            />
          );
        }

        return null;
      })}
    </ul>
  );
}

function SidebarFolder({
  item,
  pathname,
}: {
  item: PageTree.Folder;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(
    item.children.some(
      (child) =>
        (child.type === "page" && child.url === pathname) ||
        (child.type === "folder" &&
          isPathInFolder(pathname, child as PageTree.Folder)),
    ),
  );

  const hasActiveChild = item.children.some(
    (child) =>
      (child.type === "page" && child.url === pathname) ||
      (child.type === "folder" &&
        isPathInFolder(pathname, child as PageTree.Folder)),
  );

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          hasActiveChild
            ? "text-blue-900 bg-blue-50"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span>{item.name}</span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      {isOpen && (
        <ul className="ml-4 mt-1 space-y-1">
          <SidebarList items={item.children} />
        </ul>
      )}
    </li>
  );
}

function isPathInFolder(pathname: string, folder: PageTree.Folder): boolean {
  return folder.children.some(
    (child) =>
      (child.type === "page" && child.url === pathname) ||
      (child.type === "folder" && isPathInFolder(pathname, child)),
  );
}
