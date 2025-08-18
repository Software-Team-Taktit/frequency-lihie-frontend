import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Label } from "../ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Platform() {

    const [platform, setPlatform] = useState({
        name: "",
        frequency_mhz: 0.0,
        bw_khz: 0.0,
        tx_power_dbm: 0.0,
        antenna_height_m: 0.0
    });
    const [err, setErr] = useState({
        name: "",
        frequency_mhz: "",
        bw_khz: "",
        tx_power_dbm: "",
        antenna_height_m: ""
    });

    const navigate = useNavigate();

    const validatePlatform = () :boolean => {
        let valid = true;
        const tmp = {
            name: "",
            frequency_mhz: "",
            bw_khz: "",
            tx_power_dbm: "",
            antenna_height_m: ""
        };
        if(!platform.name.trim()){
            tmp.name = "name is required!";
            valid = false;
        }

        const checkPos = (val: number, field: keyof typeof tmp) => {
            if (!Number.isFinite(val)){
                tmp[field] = "must be a float number";
                valid = false;
            } else if(val <= 0){
                tmp[field] = "field must be > 0";
                valid = false;
            }
        };

        checkPos(platform.frequency_mhz, "frequency_mhz");
        checkPos(platform.bw_khz, "bw_khz");
        checkPos(platform.tx_power_dbm, "tx_power_dbm");
        checkPos(platform.antenna_height_m, "antenna_height_m");

        setErr(tmp);
        return valid;
    }

    return (
        <div>Platform</div>
    )
}

export default Platform