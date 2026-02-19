const svgLoaders = import.meta.glob<string>("../../../diagrams/svg/*.svg", {
  query: "?raw",
  import: "default"
});

const cache = new Map<string, string>();

function keyFor(filename: string) {
  return `../../../diagrams/svg/${filename}`;
}

export async function loadSvgMarkup(filename: string): Promise<string> {
  if (cache.has(filename)) {
    return cache.get(filename)!;
  }

  const key = keyFor(filename);
  const loader = svgLoaders[key];
  if (!loader) {
    throw new Error(`Missing diagram: ${filename}`);
  }

  const markup = await loader();
  cache.set(filename, markup);
  return markup;
}

export async function preloadSvgFiles(files: string[]) {
  await Promise.all(
    files.map(async (file) => {
      try {
        await loadSvgMarkup(file);
      } catch {
        // Missing assets are handled in the UI fallback.
      }
    })
  );
}
