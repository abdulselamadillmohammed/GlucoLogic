import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const inputDir = join(root, "src", "diagrams", "mermaid");
const outputDir = join(root, "src", "diagrams", "svg");

await mkdir(outputDir, { recursive: true });

const files = (await readdir(inputDir)).filter((name) => name.endsWith(".mmd"));

for (const file of files) {
  const input = join(inputDir, file);
  const output = join(outputDir, file.replace(/\.mmd$/, ".svg"));

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("npx", ["mmdc", "-i", input, "-o", output], { stdio: "inherit", shell: true });
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`mmdc failed for ${file}`));
    });
  });
}
