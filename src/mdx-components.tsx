import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { InstallSelector } from "@/components/InstallSelector";
import { Mermaid } from "@/components/Mermaid";

type MDXComponentsOptions = MDXComponents & {
  isProviderPage?: boolean;
};

export function getMDXComponents(
  options?: MDXComponentsOptions,
): MDXComponents {
  const { isProviderPage, ...components } = options || {};
  return {
    ...defaultMdxComponents,
    InstallSelector,
    Mermaid,
    ...components,
    // Put img override last to ensure it takes precedence
    img: (props) => {
      // Don't render provider logo images on provider pages (they're shown inline with the title)
      if (isProviderPage && props.src?.startsWith("/logos/")) {
        return null;
      }
      // Use default img component for all other images
      const DefaultImg = defaultMdxComponents.img;
      if (DefaultImg) {
        return <DefaultImg {...props} />;
      }
      return <img {...props} />;
    },
  };
}
