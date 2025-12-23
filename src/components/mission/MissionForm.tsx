// components/mission/MissionForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import MapPicker, { type EnvPicker } from "../mapPicker/MapPicker";
import { PlatformsApi } from "../../services/PlatformApi";
import { MissionsApi } from "../../services/MissionApi";
import { BASE_URL } from "../../services/BaseApi";

import type { Platform } from "@/interfaces/PlatformInterface";
import type {
  Mission,
  UpdateMissionRequest,
  EnvType,
  MapCodetype,
  FrequencyRequest,
  FrequencyResponse,
} from "../../interfaces/MissionInterface";
const NEW_ENV_LABELS: Record<EnvType, string> = {
    mount: "הררי",
    urban: "עירוני",
    open_space: "שטח פתוח",
};

export type MissionFormProps = {
  mode: "create" | "edit";
  initial: Mission;                
  onSaved?: (m: Mission) => void;   
  onCancel?: () => void;        
};

type Coord = { lat: number | null; lon: number | null };

export default function MissionForm({initial, onSaved, onCancel }: MissionFormProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);


  const [envCode, setEnvCode] = useState<string>("");

  const [mission, setMission] = useState({
    name: initial?.name ?? "",
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
    frequency: "",
  });

  const [showPicker, setShowPicker] = useState(false);

  const [freqResult, setFreqResult] = useState<FrequencyResponse | null>(null);
  const [freqLoading, setFreqLoading] = useState(false);

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

  useEffect(() => {
    setFreqResult({
      freq_mhz: initial.freq_mhz,
      tx_power_dbm: initial.tx_power_dbm,
    });
  }, [initial]);

  const calculateEnvType = (mapCode:MapCodetype): EnvType => {
    if (mapCode === "mount") return "mount";
    const denseCodes: MapCodetype[] = [
      "very_dense_urban",
      "dense_urban",
      "urban",
      "suburban",
    ];
    if (denseCodes.includes(mapCode)) return "urban";
    return "open_space";
  }

  const finalEnvType = useMemo<EnvType | undefined>(() => {
    if (!envCode) return undefined;
    return calculateEnvType(envCode as MapCodetype);
  }, [envCode]);

  const finalEnvLabel = useMemo<string>(() => {
    if (!finalEnvType) return "";
    return NEW_ENV_LABELS[finalEnvType] || "סביבה לא מזוהה";
  }, [finalEnvType]);


  const validate = (): boolean => {
    let valid = true;
    const tmp = { name: "", enviroment_type: "", lat: "", lon: "", platform_id: "", frequency:""};

    if (!mission.name.trim()) {                
      tmp.name = "שם משימה הוא שדה חובה";
      valid = false;
    } else if (mission.name.trim().length < 2) {
      tmp.name = "שם המשימה צריך להכיל לפחות 2 תווים";
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
    setEnvCode(picked.code);
    setCoord({ lat: picked.lat, lon: picked.lon });
    setErr((e) => ({ ...e, enviroment_type: "", lat: "", lon: "" }));
    setShowPicker(false);
  };

  const handleRequestFrequency = async () => {
    setErr((prev) => ({...prev, frequency: ""}));

    if(!validate) return;

    if(!finalEnvType || coord.lat == null || coord.lon == null){
      setErr((prev) => ({
        ...prev,
        enviroment_type:"יש לבחור נקודה חדשה על המפה כדי לחשב תדר מחדש!"
      }));
      return;
    }
    const freqReq: FrequencyRequest = {
      name: mission.name.trim(),
      coordinate: {latitude: coord.lat, longitude: coord.lon},
      enviroment_type: finalEnvType,
      platform_id: mission.platform_id,
    };
    try{
      setFreqLoading(true);
      setFreqResult(null);

      const res = await fetch(`${BASE_URL}/frequency/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freqReq),
      });
      if(!res.ok){ throw new Error("Frequency API returned error");}
      
      const data = (await res.json()) as FrequencyResponse;
      setFreqResult(data);
    } catch (e){
      console.error(e);
      setErr((prev) => ({...prev, frequency:"שגיאה בקבלת התדר ועוצמת השידור"}));
    } finally {
      setFreqLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if(!freqResult){
      setErr((prev) => ({...prev, frequency:"אין נתוני תדר / עוצמת שידור.ניתן לעדכן בלי לחשב מחדש רק אם הערכים נשארים כמו הערכים הקודמים."}));
      return;
    }

    const dto: UpdateMissionRequest = {
      name: mission.name.trim(),
      coordinate: { latitude: coord.lat!, longitude: coord.lon! },
      freq_mhz: freqResult.freq_mhz,
      tx_power_dbm: freqResult.tx_power_dbm,
      platform_id: mission.platform_id,
    };

    try{
      const saved = await (MissionsApi as any).update(initial.id, dto);
      onSaved?.(saved);
    } catch (ex : any){
      console.error(ex);
      setErr((p)=> ({
        ...p,
        frequency:"שגיאה בעדכון המשימה",
      }));
    }
  };

  const submitLabel = "עדכון";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="huninn-regular text-lg text-gray-700">שם המשימה:</Label>
        <Input id="name" type="text" className="rounded flex-1" placeholder="הכנס שם משימה" value={mission.name} 
        onChange={onChangeName}/>
        {err.name && <p className="text-sm text-red-600">{err.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="platform_id" className="huninn-regular text-lg text-gray-700">
          בחירת פלטפורמה:
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
          סוג הסביבה (לחישוב מחדש):
        </Label>
        <div className="flex gap-2">
          <Input
            id="enviroment_type"
            className="rounded flex-1"
            type="text"
            placeholder="נבחר אוטומטית מהמפה (ניתן לשינוי ידני)"
            value={finalEnvLabel}
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

      <div className="space-y-2 border-t pt-4">
          <Button
          type="button"
          className="w-full huninn-regular shadow-md hover:text-blue-600"
          onClick={handleRequestFrequency}
          disabled={freqLoading}>
            {
              freqLoading ? "מבקש תדר ועוצמת שידור..." : "קבלת תדר ועוצמת שידור מתאימה"
            }
          </Button>
          {
            err.frequency && (
              <p className="text-sm text-red-600">{err.frequency}</p>
            )
          }
          {
            freqResult && (
              <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3 space-y-1 huninn-regular text-gray-800">
                <div>
                  <strong>תדר שנבחר (MHz): </strong>
                  {freqResult.freq_mhz.toFixed(3)}
                </div>
                <div>
                  <strong>עוצמת שידור שנבחרה (dBm): </strong>
                  {freqResult.tx_power_dbm.toFixed(2)}
                </div>
              </div>
            )
          }
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
