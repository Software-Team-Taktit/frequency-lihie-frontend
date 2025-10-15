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
            <CardContent className="text-sm space-y-2 ">
                <div><strong className="huninn-bold">תדר (MHz): </strong><span className="huninn-regular">{p.frequency_mhz}</span></div>
                <div><strong className="huninn-bold">רוחב פס (kHz): </strong><span className="huninn-regular">{p.bw_khz}</span></div>
                <div><strong className="huninn-bold">עוצמת שידור (dBm): </strong><span className="huninn-regular">{p.tx_power_dbm}</span></div>
                <div><strong className="huninn-bold">גובה אנטנה (m):</strong><span className="huninn-regular">{p.antenna_height_m}</span></div>
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