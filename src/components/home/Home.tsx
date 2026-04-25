import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <main className="p-5">
            <div className="bg-blue-100 rounded-xl p-10 md:p-10 w-[1800px] h-[750px] mx-auto shadow-md flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center space-y-6 max-w-3xl w-full">
                    <h1 className="suez-one-regular text-8xl text-blue-700">ברוכים הבאים למרחבים</h1>
                    <p className="huninn-regular text-gray-700 text-2xl max-w-2xl mx-auto">
                        מערכת חכמה לניהול תדרים בשעת חירום המאפשרת הקצאה בזמן אמת לפי תנאים בשטח וצרכים מבצעיים.
                    </p>
                    <div className="flex justify-center gap-6 pt-6">
                        <Button className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200" variant="outline" onClick={() => navigate("/platform")}>פלטפורמות</Button>
                        <Button className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200" variant="outline" onClick={() => navigate("/mission")}>משימות</Button>
                        <Button className="bg-blue-500 hover:bg-blue-200 text-white px-6 py-3 rounded-lg shadow-md text-lg huninn-regular transition duration-200" variant="outline" onClick={() => navigate("/missionsMap")}>מפת משימות</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Home;