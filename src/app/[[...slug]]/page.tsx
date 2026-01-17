import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { findNeighbour } from "fumadocs-core/page-tree";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/page-actions";
import {
  getProviderLogoPath,
  getProviderSlugFromUrl,
  needsDarkModeInversion,
} from "@/lib/provider-logos";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

const DOCS_GITHUB_URL = "https://github.com/withceleste/docs";

export default async function Page(props: PageProps<"/[[...slug]]">) {
  const params = await props.params;

  // V1 Redirects (legacy routes)
  const redirects: Record<string, string> = {
    "providers/bytedance": "providers/byteplus",
  };

  const slugPath = (params.slug || []).join("/");
  if (redirects[slugPath]) {
    redirect(redirects[slugPath]);
  }

  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const neighbours = findNeighbour(source.pageTree, page.url);
  const markdownUrl = `${page.url}.mdx`;
  const githubUrl = `${DOCS_GITHUB_URL}/blob/main/content/docs/${page.path}`;

  // Check if this is a provider page and get logo info
  const providerSlug = getProviderSlugFromUrl(page.url);
  const isProviderPage = providerSlug !== null;
  const logoPath = isProviderPage ? getProviderLogoPath(providerSlug) : null;
  const needsInversion = isProviderPage && needsDarkModeInversion(providerSlug);

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      footer={{
        items: {
          previous: neighbours.previous ?? undefined,
          next: neighbours.next ?? undefined,
        },
      }}
    >
      {isProviderPage && logoPath ? (
        <div className="flex items-center gap-3">
          <img
            src={logoPath}
            alt={page.data.title}
            width={24}
            height={24}
            className={needsInversion ? "dark:invert" : ""}
          />
          <DocsTitle>{page.data.title}</DocsTitle>
        </div>
      ) : (
        <DocsTitle>{page.data.title}</DocsTitle>
      )}
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
        <LLMCopyButton markdownUrl={markdownUrl} />
        <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody data-provider-page={isProviderPage ? "true" : undefined}>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
            isProviderPage,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
