import { getLLMText, getPagesInNavOrder } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const scan = getPagesInNavOrder().map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
