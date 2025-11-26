import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <Image
            src="/icon-light.svg"
            alt="Celeste AI"
            width={24}
            height={24}
            className="w-6 h-6 dark:hidden block"
          />
          <Image
            src="/icon-dark.svg"
            alt="Celeste AI"
            width={24}
            height={24}
            className="w-6 h-6 hidden dark:block"
          />
          <span>Celeste AI</span>
        </div>
      ),
      url: "/",
    },
    links: [
      {
        text: "Website",
        url: "https://withceleste.ai",
        external: true,
      },
      {
        text: "GitHub",
        url: "https://github.com/withceleste/celeste-python",
        external: true,
      },
    ],
  };
}
