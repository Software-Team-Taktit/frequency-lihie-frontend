import { MapContainer, TileLayer, GeoJSON, useMapEvents, useMap } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import unionBoundary from "../../assets/israel_palestine_union.json";
import envCities from "../../assets/env_polygons_cities.json";
import envMountains from "../../assets/env_polygons_mountains.json";
import { Button } from "../ui/button";
import { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import {
    resolveEnviromentByCoords,
    type ResolveEnvPoint
} from "../../lib/resolveEnviromentByCoords"

export type EnvPicker = ResolveEnvPoint;


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

function MapPicker({onPick, onClose}: {onPick:(picked: EnvPicker)=> void; onClose:()=>void;}) {
    const handleClick = (lat: number, lon: number)=> {
        const result = resolveEnviromentByCoords(lat, lon);

        if(!result.ok) {
            alert(result.error);
            return;
        }

        onPick (result.picked);
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