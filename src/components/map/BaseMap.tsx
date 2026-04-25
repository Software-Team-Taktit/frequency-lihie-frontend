import { useEffect } from "react";
import type { ReactNode } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent  } from "leaflet";
import type { Feature, Geometry, GeoJsonObject } from "geojson";

import unionBoundary from "../../assets/israel_palestine_union.json";
import envCities from "../../assets/env_polygons_cities.json";
import envMountains from "../../assets/env_polygons_mountains.json";

import "leaflet/dist/leaflet.css";

type BaseMapProps = {
    children?: ReactNode;
    onMapClick?: (lat: number, lon: number) => void;
}

function MapResizer() {
    const map = useMap();

    useEffect(() => {
        const id = setTimeout(() => map.invalidateSize({animate: true}), 0);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

function ClickCatcher({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent){
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function BaseApi({ children, onMapClick }: BaseMapProps) {
    return (
        <MapContainer
            center={[31.5, 35]}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
        >

            <MapResizer />

            <TileLayer
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors, Tiles: HOT"
            />

            <GeoJSON
                data={unionBoundary as GeoJsonObject}
                style={{ color: "#111", weight: 2, fillOpacity: 0 }}
            />

            <GeoJSON
                data={envMountains as GeoJsonObject}
                style={{ color: "#a16207", weight: 1, fillOpacity: 0.12 }}
            />

            <GeoJSON
                data={envCities as GeoJsonObject}
                filter={(feature: Feature<Geometry>) => feature.geometry?.type !== "Point"}
                style={{ color: "#6b7280", weight: 1, fillOpacity: 0.15 }}
            />

            {onMapClick && <ClickCatcher onMapClick={onMapClick} />}

            {children}
        </MapContainer>
    )
}