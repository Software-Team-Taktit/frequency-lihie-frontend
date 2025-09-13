import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import * as turf from "@turf/turf";
import pRetry from "p-retry";
import type { Feature, Polygon, MultiPolygon } from "geojson";

type PolyGeom = Polygon | MultiPolygon;
type PolyFeat = Feature<PolyGeom>;

const INPUT_PATH = process.argv[2] || "tools/cities.txt";
const OUT_PATH   = "src/assets/tools/env_polygons_cities.json";
const CACHE_DIR  = "tools/cache";
const UA = "Merhavim-BoundaryBuilder/1.0 (contact: lilyelimelech@gmail.com)";

const SLEEP = (ms:number)=>new Promise(res=>setTimeout(res, ms));
const DELAY_MS = 1200;

type Code = "very_dense_urban" | "dense_urban" | "urban" | "suburban" | "rural_village";
const LABELS_HE: Record<Code,string> = {
  very_dense_urban: "צפוף מאוד מאוד",
  dense_urban:     "צפוף עירוני",
  urban:           "עירוני",
  suburban:        "פרברי",
  rural_village:   "כפרי",
};

const METROS = [
  turf.point([34.78, 32.08]), // תל-אביב
  turf.point([35.22, 31.78]), // ירושלים
  turf.point([35.00, 32.80]), // חיפה
  turf.point([34.80, 31.25]), // באר שבע
  turf.point([34.47, 31.53]), // עזה
];

const POP_OVERRIDES: Record<string, number> = {
  "ירושלים": 980_000,
  "תל אביב-יפו": 470_000,
  "חיפה": 285_000,
  "בני ברק": 215_000,
  "באר שבע": 215_000,
  "ראשון לציון": 260_000,
  "פתח תקווה": 250_000,
  "נתניה": 220_000,
  "אשדוד": 225_000,
  "חולון": 205_000,
  "אשקלון": 160_000,
  "בת ים": 130_000,
  "רמת גן": 170_000,
  "רחובות": 150_000,
  "עזה": 600_000,
  "חאן יונס": 220_000,
  "רפיח": 180_000,
};

function readCitiesList(file: string): string[] {
  return fs.readFileSync(file, "utf8")
    .split(/\r?\n/).map(s=>s.trim())
    .filter(Boolean);
}

const GAZA_HINTS = ["עזה","חאן יונס","רפיח","דיר אל-בלח","ג'באליה","בית לאהיה"];
const WB_HINTS   = ["חברון","בית לחם","רמאללה","שכם","ג'נין","קלקיליה","טול כרם","יריחו",
                    "מודיעין עילית","ביתר עילית","מעלה אדומים","אריאל","אל-בירה","סלפית","טובאס"];

function queryVariants(nameHe: string): string[] {
  const norm = (s:string)=>s.replace(/\s+/g," ").trim();
  if (GAZA_HINTS.some(h => nameHe.includes(h))) {
    return [norm(nameHe + ", Gaza Strip"), norm(nameHe)];
  }
  if (WB_HINTS.some(h => nameHe.includes(h))) {
    return [norm(nameHe + ", West Bank"), norm(nameHe)];
  }
  return [norm(nameHe + ", Israel"), norm(nameHe)];
}

async function nominatimSearch(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&extratags=1&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for "${q}"`);
  const arr: any[] = await r.json();
  const admin = arr.find(x => x?.geojson && (x.class === "boundary" || x.type === "administrative"));
  if (admin) return admin;
  return arr.find(x => x?.geojson) || null;
}

function cachePath(nameHe: string) {
  const safe = nameHe.replace(/[\\/:*?"<>|]/g,"_");
  return path.join(CACHE_DIR, safe + ".json");
}
function loadFromCache(nameHe: string): any | null {
  try {
    const p = cachePath(nameHe);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p,"utf8"));
    }
    return null;
  } catch { return null; }
}
function saveToCache(nameHe: string, obj: any) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(nameHe), JSON.stringify(obj));
}

function getPopulation(nameHe: string, res: any): number | null {
  if (POP_OVERRIDES[nameHe]) return POP_OVERRIDES[nameHe];
  const raw = res?.extratags?.population || res?.population;
  if (!raw) return null;
  const n = parseInt(String(raw).replace(/[^\d]/g,""));
  return Number.isFinite(n) ? n : null;
}

async function fetchWikidataPopulation(qid: string): Promise<number | null> {
  try {
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    const data = await r.json();
    const entity = data?.entities?.[qid];
    const claims = entity?.claims?.P1082;
    if (!Array.isArray(claims)) return null;
    let best: any = null;
    for (const c of claims) {
      const val = c?.mainsnak?.datavalue?.value;
      if (typeof val?.amount === "string") {
        const num = parseInt(val.amount.replace(/[^\d]/g,""));
        if (Number.isFinite(num)) {
          best = { num };
        }
      }
    }
    return best?.num ?? null;
  } catch { return null; }
}

function polygonToOverpassPoly(f: PolyFeat): string {
  const coords: number[][] =
    (f.geometry.type === "Polygon")
      ? (f.geometry.coordinates[0] as any)
      : (f.geometry.type === "MultiPolygon"
          ? (f.geometry.coordinates[0][0] as any)
          : []);
  return coords.map(([lon, lat]) => `${lat} ${lon}`).join(" ");
}

async function fetchBuildingsStats(feature: PolyFeat): Promise<{count: number}> {
  try {
    const poly = polygonToOverpassPoly(feature);
    if (!poly) return { count: 0 };
    const query = `
      [out:json][timeout:60];
      (
        way["building"](poly:"${poly}");
        relation["building"](poly:"${poly}");
      );
      out body;
    `.trim();

    const r = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: new URLSearchParams({ data: query })
    });
    if (!r.ok) return { count: 0 };
    const data = await r.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    const ways = elements.filter((e:any)=> e.type==="way");
    const rels = elements.filter((e:any)=> e.type==="relation");
    return { count: ways.length + rels.length };
  } catch {
    return { count: 0 };
  }
}

async function classifySmart(nameHe: string, res: any, feature: PolyFeat ): Promise<Code> {
  let pop = getPopulation(nameHe, res);
  if (pop === null && res?.extratags?.wikidata) {
    await SLEEP(400);
    pop = await fetchWikidataPopulation(res.extratags.wikidata);
  }
  if (pop !== null && !Number.isNaN(pop)) {
    if (pop >= 200_000) return "very_dense_urban";
    if (pop >= 70_000)  return "dense_urban";
    return "urban";
  }

  const areaKm2 = turf.area(feature) / 1_000_000;
  if (areaKm2 > 0) {
    await SLEEP(600);
    const stats = await fetchBuildingsStats(feature);
    const buildingsPerKm2 = stats.count / areaKm2;
    if (buildingsPerKm2 >= 800) return "dense_urban";
    if (buildingsPerKm2 >= 300) return "urban";
  }

  const center = turf.centerOfMass(feature);
  const dMetro = Math.min(...METROS.map(m => turf.distance(center as any, m as any, { units: "kilometers" })));
  const place = res?.type;
  if (place === "city") return "urban";
  if (areaKm2 <= 12 && dMetro <= 10) return "dense_urban";
  if (areaKm2 <= 25 && dMetro <= 20) return "urban";
  if (dMetro <= 25) return "suburban";
  return "rural_village";
}

async function fetchBoundaryForCity(nameHe: string) {
  const cached = loadFromCache(nameHe);
  if (cached) return cached;
  let chosen: any = null;
  for (const q of queryVariants(nameHe)) {
    chosen = await pRetry(() => nominatimSearch(q), { retries: 2 });
    await SLEEP(DELAY_MS);
    if (chosen?.geojson) break;
  }
  if (chosen?.geojson) saveToCache(nameHe, chosen);
  return chosen;
}

(async () => {
  const names = readCitiesList(INPUT_PATH);
  const feats: any[] = [];
  console.log(`Reading ${names.length} places from ${INPUT_PATH} ...`);

  for (const nameHe of names) {
    try {
      const res = await fetchBoundaryForCity(nameHe);
      if (!res?.geojson) { console.log("⚠️  אין פוליגון:", nameHe); continue; }

      const feature = turf.feature(res.geojson);
      const code: Code = await classifySmart(nameHe, res, feature);

      feature.properties = {
        env_code: code,
        label_he: LABELS_HE[code],
        city: nameHe,
        priority: 1
      };
      feats.push(feature);
      console.log(`✓ ${nameHe} → ${LABELS_HE[code]} (${code})`);
    } catch (e: any) {
      console.log(`✗ ${nameHe} :: ${e.message}`);
    }
  }

  const fc = turf.featureCollection(feats);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(fc));
  console.log(`DONE → ${OUT_PATH} (${feats.length} features)`);
})();
