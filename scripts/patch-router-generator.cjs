const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const targets = [
  path.join(root, "node_modules", "@tanstack", "router-generator", "dist", "esm", "generator.js"),
  path.join(root, "node_modules", "@tanstack", "router-generator", "dist", "cjs", "generator.cjs"),
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;

  const original = fs.readFileSync(file, "utf8");
  const patched = original.replace(/id: '\$\{node\.path\}'/g, "id: '${node.routePath}'");

  if (patched !== original) {
    fs.writeFileSync(file, patched);
    console.log(`[patch-router-generator] updated ${path.relative(root, file)}`);
  }
}
