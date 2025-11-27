import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Platform } from "../../interfaces/PlatformInterface";

export function PlatformCard({
    p, onEdit, onDelete,
} : {
    p: Platform;
    onEdit: (p: Platform) => void;
    onDelete: (p: Platform) => void;
}) {
    return (
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-white border-black">
            <CardHeader>
                <CardTitle className="text-2xl huninn-bold">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div>
                    <strong className="huninn-bold">רוחב פס  (KHz): </strong>
                    <span className="huninn-regular">{p.bw_khz}</span>
                </div>
                <div>
                    <strong className="huninn-bold">רווח אנטנת שידור (dB): </strong>
                    <span className="huninn-regular">{p.tx_gain}</span>
                </div>
                <div>
                    <strong className="huninn-bold">גובה אנטנת שידור (m): </strong>
                    <span className="huninn-regular">{p.tx_height_m}</span>
                </div>
                <div>
                    <strong className="huninn-bold">רווח אנטנת קליטה (dB): </strong>
                    <span className="huninn-regular">{p.rx_gain}</span>
                </div>
                <div>
                    <strong className="huninn-bold">גובה אנטנת קליטה (m): </strong>
                    <span className="huninn-regular">{p.rx_height_m}</span>
                </div>
                <div>
                    <strong className="huninn-bold">SNR מינימלי נדרש (dB): </strong>
                    <span className="huninn-regular">{p.min_sinr_required_db}</span>
                </div>
                <div>
                    <strong className="huninn-bold">Noise figure (dB): </strong>
                    <span className="huninn-regular">{p.noise_figure_db}</span>
                </div>
            </CardContent>
            <CardFooter className="mt-auto flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(p)}>
                    <Pencil className="h-4 w-4 mr-1"/>
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(p)}>
                    <Trash2 className="h-4 w-4 mr-1"/>
                </Button>
            </CardFooter>
        </Card>
    );
}