import * as turf from "@turf/turf";
import unionBoundary from "../assets/israel_palestine_union.json";
import envCities from "../assets/env_polygons_cities.json";
import envMountains from "../assets/env_polygons_mountains.json";

export type ResolveEnvPoint = {
    code: string;
    label: string;
    lat: number;
    lon: number;
};

type PolyLike = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

const isPolyLike = (f: any): f is PolyLike => {
    const g = f?.type === "Feature" ? f.geometry : f?.geometry || f;
    const t = g?.type;

    return (
        (t === "Polygon" || t === "MultiPolygon") &&
        Array.isArray(g?.coordinates) &&
        g.coordinates.length > 0
    );
} 

function normalizeToFeatures(input: any): GeoJSON.Feature[] {
    if (!input) return [];

    if (input.type === "FeatureCollection") return input.features as GeoJSON.Feature[];

    if (input.type === "Feature") return [input.features as GeoJSON.Feature];

    if (input.type === "GeometryCollection") {
        return (input.geometries || [])
            .filter((g: any) => g && (g.type === "Polygon" || g.type === "MultiPolygon"))
            .map((g: any) => ({ type: "Feature", geometry: g, properties: {} } as GeoJSON.Feature));
    }

    if (input.type === "Polygon" || input.type === "MultiPolygon") {
        return [{ type: "Feature", geometry: input, properties: {} } as GeoJSON.Feature];
    }

    return [];
}

const areaKm2 = (f : PolyLike) => turf.area(f as any) / 1_000_000;

const unionFeatures: PolyLike[] = normalizeToFeatures(unionBoundary as any).filter(isPolyLike);

const envFeatures: PolyLike[] = [
    ...normalizeToFeatures(envCities as any),
    ...normalizeToFeatures(envMountains as any),
].filter(isPolyLike);

const sortedEnv = envFeatures.slice().sort((a, b) => {
    const pa = ((a.properties as any)?.priority ?? 999);
    const pb = ((b.properties as any)?.priority ?? 999);
    if (pa !== pb) return pa - pb;
    return areaKm2(a) - areaKm2(b);
});

function detectSwapPointOrder(): boolean {
    const testLonLat = turf.point([35,31.5]);
    const testLatLon = turf.point([31.5,35]);

    const insideLonLat = unionFeatures.some((f) => {
        try{
            return turf.booleanPointInPolygon(testLonLat, f as any);
        } catch {
            return false;
        }
    });

    const insideLatLon = unionFeatures.some((f) => {
        try {
            return turf.booleanPointInPolygon(testLatLon, f as any);
        } catch {
            return false;
        }
    });

    return !insideLonLat && insideLatLon;
}

const swapPointOrder = detectSwapPointOrder();

export function resolveEnviromentByCoords(lat: number, lon: number): 
{ ok: true; picked: ResolveEnvPoint } | { ok: false; error: string }{
    if (!Number.isFinite(lat) || !Number.isFinite(lon)){
        return { ok: false, error: "נ.צ. לא תקינה" };
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return { ok: false, error: "ערכי קו רוחב / קו אורך לא תקינים" };
    }
    
    const pt = turf.point(swapPointOrder ? [lat, lon] : [lon, lat]);

    const inside = 
        unionFeatures.length > 0 &&
        unionFeatures.some((f) => {
            try {
                return turf.booleanPointInPolygon(pt, f as any);
            } catch {
                return false;
            }
        });

    if (!inside) return { ok: false, error: "הנקודה מחוץ לתחום הארץ" };

    for (const f of sortedEnv) {
        try {
            if (turf.booleanPointInPolygon(pt, f as any)) {
                const props: any = f.properties ?? {};

                return {
                    ok: true,
                    picked: {
                    code: String(props.env_code ?? ""),
                    label: String(props.label_he ?? ""),
                    lat,
                    lon,
                },
            };
        }
        } catch {
            // ignore invalid polygon
        }
    }

    return {
        ok: true,
        picked: {
            code: "open_space",
            label: "שטח פתוח",
            lat,
            lon,
        },
    };
}