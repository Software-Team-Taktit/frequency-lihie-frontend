import { MapContainer, TileLayer, GeoJSON, useMapEvents, useMap } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import * as turf from "@turf/turf";
import unionBoundary from "../../assets/israel_palestine_union.json";
import envCities from "../../assets/env_polygons_cities.json";
import envMountains from "../../assets/env_polygons_mountains.json";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import 'leaflet/dist/leaflet.css';

export type EnvPicker = { code: string; label: string; lat: number; lon: number };


function ClickCatcher({ onClick }: { onClick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent){
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const id = setTimeout(() => map.invalidateSize({ animate: true }), 0);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

type PolyLike = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
const isPolyLike = (f: any): f is PolyLike => {
    const g = f?.type === "Feature" ? f.geometry : f?.geometry || f;
    const t = g?.type;
    return (
        (t === "Polygon" || t === "MultiPolygon") &&
        Array.isArray(g?.coordinates) &&
        g.coordinates.length > 0
    );
};
function normalizeToFeatures(input: any): GeoJSON.Feature[] {
    if (!input) return [];
    if (input.type === "FeatureCollection") return input.features as GeoJSON.Feature[];
    if (input.type === "Feature") return [input as GeoJSON.Feature];
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


function MapPicker({onPick, onClose}: {onPick:(picked: EnvPicker)=> void; onClose:()=>void;}) {
    const [swapPointOrder, setSwapPointOrder] = useState(false);

    const unionFeatures: PolyLike[] = normalizeToFeatures(unionBoundary as any).filter(isPolyLike);

    const envFeatures: PolyLike[] = [
        ...normalizeToFeatures(envCities as any),
        ...normalizeToFeatures(envMountains as any),
    ].filter(isPolyLike);

    const areaKm2 = (f: PolyLike) => turf.area(f as any) / 1_000_000;

    const sortedEnv = envFeatures.slice().sort((a, b) => {
        const pa = ((a.properties as any)?.priority ?? 999);
        const pb = ((b.properties as any)?.priority ?? 999);
        if (pa !== pb) return pa - pb;
        return areaKm2(a) - areaKm2(b);
    });
    

    useEffect(() => {
        const testLonLat = turf.point([35, 31.5]);   // lon,lat
        const testLatLon = turf.point([31.5, 35]);   // lat,lon
        const insideLonLat = unionFeatures.some(f => turf.booleanPointInPolygon(testLonLat, f as any));
        const insideLatLon = unionFeatures.some(f => turf.booleanPointInPolygon(testLatLon, f as any));

        if (!insideLonLat && insideLatLon) {
            console.warn("⚠️ GeoJSON משתמש בסדר lat,lon — מחליפים");
            setSwapPointOrder(true);
        }
    }, []);

    const handleClick = (lat: number, lon: number) => {
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

        if (!inside) {
            alert("הנקודה מחוץ לתחום הארץ");
            return;
        }


        let picked: EnvPicker | null = null;
        
        for (const f of sortedEnv){
            try{
                if(turf.booleanPointInPolygon(pt, f as any)){
                    const props: any = f.properties ?? {};
                    picked = {
                        code: String(props.env_code ?? ""),
                        label: String(props.label_he ?? ""),
                        lat,
                        lon,
                    };
                    break;
                }
            } catch {}
        }
        if(!picked){
            picked = { code: "open_space", label: "שטח פתוח", lat, lon }
        }
        onPick(picked);
        onClose();
    }
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white w-[1000px] h-[640px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
                <div className="px-4 py-3 flex items-center justify-between border-b">
                    <h3 className="text-lg font-semibold">בחר/י נקודה על המפה</h3>
                    <Button type="button" onClick={onClose}>סגירה</Button>
                </div>
                <div className="flex-1">
                    <MapContainer center={[31.5,35]} zoom={7} style={{ height: "100%", width: "100%" }}>
                        <MapResizer/>
                        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors, Tiles: HOT'
                        eventHandlers={{
                            tileload: (e) => console.log("✅ tile loaded", e.coords),
                            tileerror: (e) => console.log('❌ tile error', e)
                        }}/>
                        <GeoJSON data={unionBoundary as any} style={{ color: "#111", weight: 2, fillOpacity: 0 }}/>
                        <GeoJSON data={envMountains as any} style={{ color: "#a16207", weight: 1, fillOpacity: 0.12 }} />
                        <GeoJSON data={envCities as any} filter={(f: any) => f?.geometry?.type !== 'Point'} style={{ color: "#6b7280", weight: 1, fillOpacity: 0.15 }} />
                        <ClickCatcher onClick={handleClick}/>
                    </MapContainer>
                </div>
            </div>
        </div>
    )
}

export default MapPicker