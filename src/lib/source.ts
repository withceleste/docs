import { type InferPageType, loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import type { Item, Node } from "fumadocs-core/page-tree";
import { docs } from "@/.source";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

function _scanNavNodes(nodes: Node[]): Item[] {
  const out: Item[] = [];

  for (const node of nodes) {
    if (node.type === "folder") {
      // Include folder index (if any) before its children (matches Fumadocs nav order)
      if (node.index && !node.index.external) {
        out.push(node.index);
      }
      out.push(..._scanNavNodes(node.children));
      continue;
    }

    if (node.type === "page" && !node.external) {
      out.push(node);
    }
  }

  return out;
}

export function getPagesInNavOrder(
  language?: string,
): InferPageType<typeof source>[] {
  const tree = source.getPageTree(language);

  const orderedNodes = _scanNavNodes(tree.children);
  if (tree.fallback) {
    // Keep fallback (unlisted/isolated) pages last.
    orderedNodes.push(..._scanNavNodes(tree.fallback.children));
  }

  const pages: InferPageType<typeof source>[] = [];
  const seen = new Set<string>();

  for (const node of orderedNodes) {
    const page = source.getNodePage(node, language);
    if (!page) continue;

    // Avoid accidental duplicates from index/child overlap.
    if (seen.has(page.url)) continue;
    seen.add(page.url);

    pages.push(page);
  }

  return pages;
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/docs/${segments.join("/")}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
