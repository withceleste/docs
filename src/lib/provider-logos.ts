/**
 * Provider logo mapping utilities
 * Maps provider slugs to their logo paths and determines dark mode inversion needs
 */

/**
 * Maps provider slugs to logo file names.
 * Some providers have different slugs than their logo file names.
 */
const logoMap: Record<string, string> = {
  byteplus: 'bytedance', // Special case: byteplus uses bytedance.svg
};

/**
 * Providers whose logos need dark mode inversion
 */
const logosNeedingInversion = new Set([
  'openai',
  'anthropic',
  'byteplus', // uses bytedance.svg
  'bfl',
  'xai',
  'elevenlabs',
  'groq',
  'deepseek',
  'moonshot',
]);

/**
 * Get the logo path for a provider slug
 * @param slug Provider slug (e.g., 'openai', 'byteplus')
 * @returns Logo path (e.g., '/logos/openai.svg') or null if not found
 */
export function getProviderLogoPath(slug: string): string | null {
  const logoSlug = logoMap[slug] || slug;
  return `/logos/${logoSlug}.svg`;
}

/**
 * Check if a provider logo needs dark mode inversion
 * @param slug Provider slug
 * @returns true if the logo needs dark:invert class
 */
export function needsDarkModeInversion(slug: string): boolean {
  return logosNeedingInversion.has(slug);
}

/**
 * Check if a URL path is a provider page
 * @param url Page URL (e.g., '/providers/openai')
 * @returns true if the URL is a provider page
 */
export function isProviderPage(url: string): boolean {
  return url.startsWith('/providers/');
}

/**
 * Extract provider slug from a provider page URL
 * @param url Provider page URL (e.g., '/providers/openai')
 * @returns Provider slug (e.g., 'openai') or null if not a provider page
 */
export function getProviderSlugFromUrl(url: string): string | null {
  if (!isProviderPage(url)) {
    return null;
  }
  const parts = url.split('/');
  return parts[2] || null; // ['', 'providers', 'openai']
}
