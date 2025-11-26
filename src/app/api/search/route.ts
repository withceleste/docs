import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Use staticGET for static export compatibility
export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
});

// Required for static export
export const dynamic = "force-static";
