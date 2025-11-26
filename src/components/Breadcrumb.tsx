"use client";

import { usePathname } from "next/navigation";
import { useBreadcrumb } from "fumadocs-core/breadcrumb";
import * as PageTree from "fumadocs-core/page-tree";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumb({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname();
  const items = useBreadcrumb(pathname, tree);

  if (items.length === 0) return null;

  return (
    <div className="mb-4 flex flex-row items-center gap-1 text-sm font-medium text-gray-600">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i !== 0 && <ChevronRight className="size-4 shrink-0" />}
          {item.url ? (
            <Link href={item.url} className="truncate hover:text-gray-900">
              {item.name}
            </Link>
          ) : (
            <span className="truncate">{item.name}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
