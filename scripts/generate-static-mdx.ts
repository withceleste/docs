#!/usr/bin/env bun
/**
 * Generate static .mdx files for LLM consumption after Next.js build.
 * 
 * This script generates markdown files in out/docs/ that correspond to
 * the API route /llms.mdx/docs/[[...slug]] for static export compatibility.
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { source, getPagesInNavOrder, getLLMText } from "../src/lib/source";

async function generateStaticMdxFiles() {
  const outDir = join(process.cwd(), "out", "docs");
  const pages = getPagesInNavOrder();

  console.log(`Generating ${pages.length} static MDX files...`);

  for (const page of pages) {
    const markdown = await getLLMText(page);
    // Convert page URL to file path (e.g., "providers/openai" -> "providers/openai.mdx")
    const filePath = join(outDir, `${page.url}.mdx`);
    const fileDir = dirname(filePath);

    // Ensure directory exists
    await mkdir(fileDir, { recursive: true });

    // Write markdown file
    await writeFile(filePath, markdown, "utf-8");
    console.log(`  ✓ ${page.url}.mdx`);
  }

  console.log(`\n✓ Generated ${pages.length} static MDX files in ${outDir}`);
}

generateStaticMdxFiles().catch((error) => {
  console.error("Error generating static MDX files:", error);
  process.exit(1);
});
