import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import path from "node:path";

const docsRoot = path.resolve("..");

export default defineConfig({
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        "@lib": path.resolve("./src/lib"),
        "@components": path.resolve("./src/components"),
        "@docs": docsRoot,
      },
    },
    server: {
      watch: {
        // Watch markdown files outside of site/ so changes trigger reload
        ignored: ["!**/docs/04_modules/**", "!**/docs/INDEX.md"],
      },
    },
    plugins: [
      {
        // Custom plugin: invalidate parsed data when .md files change
        name: "ecf-docs-watcher",
        configureServer(server) {
          const watchPaths = [
            path.join(docsRoot, "04_modules"),
            path.join(docsRoot, "INDEX.md"),
          ];
          for (const p of watchPaths) {
            server.watcher.add(p);
          }
          server.watcher.on("change", (file) => {
            if (file.endsWith(".md")) {
              // Invalidate all .astro pages so they re-run the parser
              const mods = server.moduleGraph.getModulesByFile(file);
              if (!mods?.size) {
                // .md isn't a Vite module — trigger full page reload
                server.ws.send({ type: "full-reload" });
              }
            }
          });
        },
      },
    ],
  },
});
