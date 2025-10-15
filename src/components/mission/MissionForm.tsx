// components/mission/MissionForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import MapPicker, { type EnvPicker } from "../mapPicker/MapPicker";

import { PlatformsApi } from "../../services/PlatformApi";
import { MissionsApi } from "../../services/MissionApi";

import type { Platform } from "@/interfaces/PlatformInterface";
import type { Mission } from "../../interfaces/MissionInterface";

export type MissionFormProps = {
  mode: "create" | "edit";
  initial?: Mission;                
  onSaved?: (m: Mission) => void;   
  onCancel?: () => void;        
};

type Coord = { lat: number | null; lon: number | null };

export default function MissionForm({ mode, initial, onSaved, onCancel }: MissionFormProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  const [mission, setMission] = useState({
    name: initial?.name ?? "",
    enviroment_type: initial?.enviroment_type ?? "",
    platform_id: initial?.platform_id ?? "",
  });

  const [coord, setCoord] = useState<Coord>({
    lat: initial?.coordinate?.latitude ?? null,
    lon: initial?.coordinate?.longitude ?? null,
  });

  const [err, setErr] = useState({
    name: "",
    enviroment_type: "",
    lat: "",
    lon: "",
    platform_id: "",
  });

  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setMission({
        name: initial?.name ?? "",
        enviroment_type: initial.enviroment_type ?? "",
        platform_id: initial.platform_id ?? "",
      });
      setCoord({
        lat: initial.coordinate?.latitude ?? null,
        lon: initial.coordinate?.longitude ?? null,
      });
      setErr({ name: "", enviroment_type: "", lat: "", lon: "", platform_id: "" });
    }
  }, [mode, initial]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPlatforms(true);
        const list = await PlatformsApi.list();
        setPlatforms(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        setErr((p) => ({ ...p, platform_id: "שגיאה בטעינות הפלטפורמות" }));
      } finally {
        setLoadingPlatforms(false);
      }
    })();
  }, []);

  const submitLabel = useMemo(() => (mode === "edit" ? "עדכון" : "יצירת משימה"), [mode]);

  const validate = (): boolean => {
    let valid = true;
    const tmp = { name: "", enviroment_type: "", lat: "", lon: "", platform_id: "" };

    if (!mission.name.trim()) {                
      tmp.name = "שם משימה הוא שדה חובה";
      valid = false;
    } else if (mission.name.trim().length < 2) {
      tmp.name = "שם המשימה צריך להכיל לפחות 2 תווים";
      valid = false;
    }

    if (!mission.enviroment_type.trim()) {
      tmp.enviroment_type = "שדה חובה!";
      valid = false;
    }

    if (coord.lat == null || coord.lon == null) {
      tmp.lat = "בחר/י נקודה על המפה.";
      tmp.lon = "";
      valid = false;
    } else {
      if (coord.lat < -90 || coord.lat > 90) {
        tmp.lat = "קו רוחב חייב להיות בין 90- ל-90.";
        valid = false;
      }
      if (coord.lon < -180 || coord.lon > 180) {
        tmp.lon = "קו אורך חייב להיות בין 180- ל-180.";
        valid = false;
      }
    }

    if (!mission.platform_id) {
      tmp.platform_id = "בחר/י פלטפורמה מהרשימה!";
      valid = false;
    }

    setErr(tmp);
    return valid;
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMission((p) => ({ ...p, name: e.target.value }));
    if (err.name) setErr((prev) => ({ ...prev, name: "" }));
  };

  const onChangeEnv = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMission((p) => ({ ...p, enviroment_type: e.target.value }));
    if (err.enviroment_type) setErr((prev) => ({ ...prev, enviroment_type: "" }));
  };

  const onChangePlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMission((p) => ({ ...p, platform_id: e.target.value }));
    if (err.platform_id) setErr((prev) => ({ ...prev, platform_id: "" }));
  };

  const handlePickFromMap = (picked: EnvPicker) => {
    setMission((p) => ({ ...p, enviroment_type: picked.code }));
    setCoord({ lat: picked.lat, lon: picked.lon });
    setErr((e) => ({ ...e, enviroment_type: "", lat: "", lon: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dto: any = {
      name: mission.name.trim(),
      coordinate: { latitude: coord.lat!, longitude: coord.lon! },
      enviroment_type: mission.enviroment_type.trim(),
      platform_id: mission.platform_id,
    };

    try {
      let saved: Mission;
      if (mode === "edit" && initial) {
        saved = await (MissionsApi as any).update(initial.id, dto);
      } else {
        saved = await MissionsApi.create(dto as any);
      }
      onSaved?.(saved);
    } catch (ex: any) {
      const next = { ...err };
      const detail = ex?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach((d: any) => {
          const path = Array.isArray(d.loc) ? d.loc : [];
          const msg = d.msg || "שדה לא תקין";
          if (path[1] === "coordinate" && path[2] === "lat") next.lat = msg;
          else if (path[1] === "coordinate" && path[2] === "lon") next.lon = msg;
          else if (path[1] === "enviroment_type") next.enviroment_type = msg;
          else if (path[1] === "platform_id") next.platform_id = msg;
        });
        setErr(next);
        return;
      }
      setErr((p) => ({ ...p, enviroment_type: "שגיאה בשליחה" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="huninn-regular text-lg text-gray-700">שם המשימה</Label>
        <Input id="name" type="text" className="rounded flex-1" placeholder="הכנס שם משימה" value={mission.name} 
        onChange={onChangeName}/>
        {err.name && <p className="text-sm text-red-600">{err.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="platform_id" className="huninn-regular text-lg text-gray-700">
          בחירת פלטפורמה
        </Label>
        <select
          id="platform_id"
          className="w-full rounded border border-gray-300 p-2"
          value={mission.platform_id}
          onChange={onChangePlatform}
          disabled={loadingPlatforms}
        >
          <option value="">{loadingPlatforms ? "טוען..." : "בחר פלטפורמה..."}</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {err.platform_id && <p className="text-sm text-red-600">{err.platform_id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="enviroment_type" className="huninn-regular text-lg text-gray-700">
          סוג הסביבה:
        </Label>
        <div className="flex gap-2">
          <Input
            id="enviroment_type"
            className="rounded flex-1"
            type="text"
            placeholder="נבחר אוטומטית מהמפה (ניתן לשינוי ידני)"
            value={mission.enviroment_type}
            onChange={onChangeEnv}
          />
          <Button type="button" onClick={() => setShowPicker(true)}>
            בחירה מהמפה
          </Button>
        </div>
        {err.enviroment_type && <p className="text-sm text-red-600">{err.enviroment_type}</p>}
      </div>

      <div className="space-y-1">
        <Label className="huninn-regular text-lg text-gray-700">נקודת הציון שנבחרה:</Label>
        <div className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
          {coord.lat == null ? "לא נבחרה נקודה" : `${coord.lat.toFixed(6)}, ${coord.lon!.toFixed(6)}`}
        </div>
        {(err.lat || err.lon) && <p className="text-sm text-red-600">{err.lat || err.lon}</p>}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" onClick={onCancel} className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black">
            ביטול
          </Button>
        )}
        <Button className="hover:text-blue-900 border rounded-xl text-right huninn-regular border-black" type="submit">
          {submitLabel}
        </Button>
      </div>

      {showPicker && (
        <MapPicker onPick={handlePickFromMap} onClose={() => setShowPicker(false)} />
      )}
    </form>
  );
}
