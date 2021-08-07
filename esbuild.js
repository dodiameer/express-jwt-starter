const esbuild = require("esbuild")

;(async () => {
  await esbuild.build({
    format: "cjs",
    target: ["node14"],
    outfile: "./dist/index.js",
    entryPoints: ["./src/index.ts"],
    bundle: true,
    minify: false,
    sourcemap: false,
    platform: "node",
  })
})()
