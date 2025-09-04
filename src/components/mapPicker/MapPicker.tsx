import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import unionBoundary from "../../assets/israel_palestine_union.json";
import envPolys from "../../assets/env_polygons_starter.json";
import { Button } from "../ui/button";

type EnvPicker = { code: string; label: string; lat: number; lon: number };

function ClickCatcher({ onClick }: { onClick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent){
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapPicker({onPick, onClose}: {onPick:(picked: EnvPicker)=> void; onClose:()=>void;}) {
    const unionFeatures = (unionBoundary as any)?.type === "FeatureCollection" ?
        (unionBoundary as any)?.features :
        [(unionBoundary as any)];

    const envFeatures: any[] = 
        (envPolys as any)?.type === "FeatureCollection" ? 
        (envPolys as any)?.features :
        [(envPolys as any)];

    const sortedEnv = envFeatures.slice().sort(
        (a,b) => 
        ((a.properties?.priority as number) ?? 999) - 
        ((b.properties?.priority as number) ?? 999)
    );

    const handleClick = (lat: number, lon: number) => {
        const pt = turf.point([lon,lat]);

        const inside = unionFeatures.some((f: any)=> turf.booleanPointInPolygon(pt, f as any));
        if(!inside) {
            alert("הנקודה מחוץ לתחום הארץ");
            return;
        }

        let picked: EnvPicker | null = null;
        for (const f of sortedEnv) {
            if(turf.booleanPointInPolygon(pt, f as any)) {
                picked = {
                    code: String(f.properties?.env_code ?? ""),
                    label: String(f.properties?.label_he ?? ""),
                    lat, lon
                };
                break;
            }
        }
        if(!picked){
            picked = { code: "rural_village", label: "כפרי", lat, lon };
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
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <GeoJSON data={unionBoundary as any} style={{ color: "#111", weight: 2, fillOpacity: 0 }}/>
                        <GeoJSON data={envPolys as any} style={{ color: "#6b7280", weight: 1, fillOpacity: 0.15 }} />
                        <ClickCatcher onClick={handleClick}/>
                    </MapContainer>
                </div>
            </div>
        </div>
    )
}

export default MapPicker