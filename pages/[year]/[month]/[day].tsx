import { get } from "http";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DatePage() {
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const [venue, setVenue] = useState<"Killarney" | "Tralee">("Killarney");

  const { day, month, year } = router.query;

  const [date, setDate] = useState<Date>(new Date());

  function getDateAndFormat() {
    let d = new Date();
    try {
      if (typeof month == "string" && (month as unknown as number) <= 12) {
        if (typeof year == "string" && (year.length == 4 || year.length == 2)) {
          if (typeof day == "string" && (day as unknown as number) <= 31)
            d = new Date(month + "/" + day + "/" + year);
          setDate(d);
        }
      }
    } catch {
      console.log("Incorrect Date Given");
    }
  }

  useEffect(() => {
    getDateAndFormat();
  }, []);
  return (
    <div className="min-h-screen bg-blue-900 p-5">
      <h1 className="font-bold text-2xl">
        {"Bookings for " + date.toDateString()}
      </h1>
      <div className="grid grid-cols-2 mt-5 bg-white">
        <button
          onClick={() => {
            setConfirmed(true);
          }}
          className={
            confirmed
              ? "bg-black text-white font-bold"
              : "bg-gray-600 text-white"
          }
        >
          Confirmed
        </button>
        <button
          onClick={() => {
            setConfirmed(false);
          }}
          className={
            !confirmed
              ? "bg-black text-white font-bold"
              : "bg-gray-600 text-white"
          }
        >
          Unconfirmed
        </button>
      </div>
      <div className="flex flex-row w-fit gap-5 ml-auto [&>*]:my-auto mt-5">
        <label className="font-bold">Venue:</label>
        <select
          onChange={(e) => setVenue(e.target.value as "Killarney" | "Tralee")}
          value={venue}
          className="select select-bordered w-full max-w-xs mt-5 "
        >
          <option value="Killarney">Celtic Steps the Show : Killarney</option>
          <option value="Tralee">Celtic Steps the Show : Tralee</option>
        </select>
      </div>
      <div></div>
    </div>
  );
}
