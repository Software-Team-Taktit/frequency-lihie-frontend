import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import unionBoundary from "../../assets/israel_palestine_union.json";
import envPolys from "../../assets/env_polygons_starter.json";

type EnvPicker = { code: string; label: string; lat: number; lon: number };

function ClickCatcher({ onClick }: { onClick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent){
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapPicker() {
  return (
    <div>MapPicker</div>
  )
}

export default MapPicker