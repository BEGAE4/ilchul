/**
 * Server-side route handlers should prefer the private Docker-network address.
 * The public URL remains a local-development fallback only.
 */
export function getServerApiBaseUrl(): string | undefined {
  return (
    process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL
  );
}
