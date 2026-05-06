const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type OpenApiDocument = {
  paths?: Record<string, Record<string, unknown>>;
};

let openApiPathsPromise: Promise<string[]> | null = null;

async function getOpenApiPaths(signal?: AbortSignal) {
  openApiPathsPromise ??= fetchJson<OpenApiDocument>("/openapi.json", signal)
    .then((openApi) =>
      Object.entries(openApi.paths ?? [])
        .filter(([, methods]) => "get" in methods)
        .map(([path]) => path)
    )
    .catch(() => []);

  return openApiPathsPromise;
}

export async function fetchJson<T>(
  path: string,
  signal?: AbortSignal,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON from ${API_BASE_URL}${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchFirstJson<T>(
  paths: string[],
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await fetchJson<T>(path, signal);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

export async function fetchApiResource<T>(
  resourceName: string,
  fallbackPaths: string[],
  signal?: AbortSignal
): Promise<T> {
  const openApiPaths = await getOpenApiPaths(signal);
  const documentedPath = openApiPaths.find((path) =>
    path.toLowerCase().includes(resourceName.toLowerCase())
  );
  const paths = documentedPath
    ? [documentedPath, ...fallbackPaths]
    : fallbackPaths;

  return fetchFirstJson<T>(paths, signal);
}
