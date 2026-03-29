import { Button } from "../ui/button";
import {
    missionActivityFilterOptions,
    type MissionActivityFilterValue
} from "../../lib/missionFilters";

type MissionActivityFilterProps = {
    value: MissionActivityFilterValue;
    onChange: (value: MissionActivityFilterValue) => void;
};

function MissionActivityFilter({
    value,
    onChange,
} : MissionActivityFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {missionActivityFilterOptions.map((option) => {
                const isSelected = value == option.value;
                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        onClick={() => onChange(option.value)}
                        className={`rounded-full huninn-bold border-black ${
                            isSelected
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : "bg-white text-blue-700 hover:bg-blue-50"
                        }`}
                    >
                        {option.label}
                    </Button>
                )
            })}
        </div>
    )
}
export default MissionActivityFilter;