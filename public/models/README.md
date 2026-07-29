# Optional 3D Shep model (GLB)

Procedural Shep is the default in chat. To use an imported sheep model:

1. Download a cute sheep GLB (see links in `src/lib/shep-model-config.ts`).
2. Save it as **`shep.glb`** in this folder (`public/models/shep.glb`).
3. Set **`SHEP_USE_GLB = true`** in `src/lib/shep-model-config.ts`.
4. Restart the dev server and open `/chat`.

If the file is missing or `SHEP_USE_GLB` is `false`, the app uses procedural Shep with no network requests.

## Recommended sources

- [Cute Sheep (Sketchfab)](https://sketchfab.com/3d-models/cute-sheep-2d7689003081441596ead936ffe49b15) — export GLB, CC Attribution
- [Quaternius Sheep (CC0)](https://poly.pizza/m/rgJXF570ZK) — low-poly animated

After adding a GLB, you may need to tune scale in `SHEP_SCENE.glbTargetHeight` in `shep-model-config.ts`.
