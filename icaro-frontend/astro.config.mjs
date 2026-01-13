// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node"; // <--- Importamos el adaptador
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server", // <--- CAMBIO CLAVE: Activamos SSR
  adapter: node({
    mode: "standalone", // Optimizado para Docker (levanta su propio servidor)
  }),
  vite: {
    plugins: [
      // @ts-expect-error: Conflicto de tipos entre versiones de Vite (Astro vs Tailwind), seguro ignorar.
      tailwindcss(),
    ],
  },
  server: {
    host: true, // Útil para desarrollo local, expone en red
    port: 4321,
  },
});
