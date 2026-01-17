import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export const WEBSITE_URL = "https://withceleste.ai";
export const GITHUB_URL = "https://github.com/withceleste/celeste-python";

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
  };
}
