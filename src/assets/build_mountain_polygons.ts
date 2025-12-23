import fs from "fs";
import path from "path";
import * as turf from "@turf/turf";
import { fromFile } from "geotiff";
import type {
  Feature,
  FeatureCollection,
  Point,
  Polygon,
  MultiPolygon,
} from "geojson";

/**
 * CONFIG
 */
const DEM_DIR = path.resolve("mount_polygons"); // ✅ folder with your 9 .tif files
const OUTPUT = path.resolve("src/assets/env_polygons_mountains.json");

// Start with these (balanced for Israel). We can tune later.
const HEIGHT_THRESHOLD = 350; // meters (captures mountains + hills)
const SLOPE_THRESHOLD = 6;    // degrees (captures hilly terrain)
const SAMPLE_STEP = 5;        // sample every N pixels

type PolyLike = Feature<Polygon | MultiPolygon>;

const deg = (n: number) => (n * 180) / Math.PI;

function computeSlopeDeg(z1: number, z2: number, distanceMeters: number): number {
  return deg(Math.atan(Math.abs(z1 - z2) / distanceMeters));
}

/**
 * Build a polygon/multipolygon from a single DEM tile
 */
async function processTiff(filePath: string): Promise<PolyLike[]> {
  const tiff = await fromFile(filePath);
  const image = await tiff.getImage();

  // ✅ Fix for typings: no getSize()
  const width = (image as any).getWidth();
  const height = (image as any).getHeight();

  const bbox = (image as any).getBoundingBox() as [number, number, number, number];
  // bbox: [minLon, minLat, maxLon, maxLat]
  const xRes = (bbox[2] - bbox[0]) / width;
  const yRes = (bbox[3] - bbox[1]) / height;

  const data = (await image.readRasters({ interleave: true })) as unknown as Float32Array;

  let minZ = Infinity;
  let maxZ = -Infinity;

  const points: Feature<Point>[] = [];

  for (let y = 0; y < height - SAMPLE_STEP; y += SAMPLE_STEP) {
    for (let x = 0; x < width - SAMPLE_STEP; x += SAMPLE_STEP) {
      const i = y * width + x;

      const z = (data as any)[i];
      const z2 = (data as any)[i + SAMPLE_STEP];

      if (!Number.isFinite(z) || !Number.isFinite(z2)) continue;

      // sanity filter (avoid weird DEM sentinel values)
      if (z < -500 || z > 10000) continue;
      if (z2 < -500 || z2 > 10000) continue;

      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;

      // rough meters conversion. Good enough for classification
      const approxMeters = SAMPLE_STEP * xRes * 111_000;
      const slope = computeSlopeDeg(z, z2, approxMeters);

      if (z >= HEIGHT_THRESHOLD || slope >= SLOPE_THRESHOLD) {
        const lon = bbox[0] + x * xRes;
        const lat = bbox[3] - y * yRes; // flip Y because raster is top->down
        points.push(turf.point([lon, lat]) as Feature<Point>);
      }
    }
  }

  console.log(`   ↳ minZ/maxZ: ${minZ} ${maxZ} picked points: ${points.length}`);

  // Too few points => no reliable hull
  if (points.length < 300) return [];

  const fc = turf.featureCollection(points) as unknown as FeatureCollection<Point>;

  // concave -> convex -> envelope (always returns a polygon)
  let hull: any = null;

  try {
    hull = turf.concave(fc as any, { maxEdge: 2, units: "kilometers" });
  } catch {}

  if (!hull) {
    try {
      hull = turf.convex(fc as any);
    } catch {}
  }

  if (!hull) {
    try {
      hull = turf.envelope(fc as any);
    } catch {}
  }

  if (!hull || !hull.geometry) {
    console.log("   ↳ hull is null even after fallbacks");
    return [];
  }

  const gType = hull.geometry.type;
  console.log("   ↳ hull geometry:", gType);

  // Accept Polygon and MultiPolygon
  if (gType !== "Polygon" && gType !== "MultiPolygon") {
    console.log("   ↳ unsupported hull type:", gType);
    return [];
  }

  const poly = hull as PolyLike;
  poly.properties = {
    env_code: "mount",
    label_he: "הררי",
    priority: 10, // ✅ urban should win in MapPicker (lower priority = higher precedence)
  };

  return [poly];
}

/**
 * MAIN
 */
(async () => {
  if (!fs.existsSync(DEM_DIR)) {
    console.error("❌ DEM folder not found:", DEM_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(DEM_DIR)
    .filter((f) => f.toLowerCase().endsWith(".tif"));

  if (files.length === 0) {
    console.error("❌ No .tif files found in:", DEM_DIR);
    process.exit(1);
  }

  const features: PolyLike[] = [];

  for (const f of files) {
    console.log("⛰️ Processing", f);
    const polys = await processTiff(path.join(DEM_DIR, f));
    features.push(...polys);
  }

  const out = {
    type: "FeatureCollection",
    features,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log("✅ Written:", OUTPUT);
})();
