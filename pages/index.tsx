import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Booking = {
  id: number;
  ContactName: string;
  ContactEmail: string;
  Venue: string;
  NumberOfGuests: number;
  Date: Date;
  TourCompany: string;
  Approved: boolean;
};

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase.from("Bookings").select();
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    const bookings: Booking[] = [];
    data?.forEach((entry) => {
      bookings.push({
        id: entry.id,
        ContactName: entry.ContactName,
        ContactEmail: entry.ContactEmail,
        Venue: entry.Venue,
        NumberOfGuests: entry.NumberOfGuests,
        Date: entry.Date,
        TourCompany: entry.TourCompany,
        Approved: entry.Approved,
      });
    });

    console.log("Fetched bookings:", bookings);
    setBookings(bookings);
  }

  function getNextThreeDaysSkippingSaturday() {
    const result = [];
    let date = new Date();

    result.push(new Date(date)); // include today
    while (result.length < 6) {
      date.setDate(date.getDate() + 1); // move to the next day
      if (date.getDay() !== 6) {
        // 6 = Saturday
        result.push(new Date(date)); // store a copy
      }
    }

    return result;
  }

  return (
    <div className="min-h-screen bg-blue-900 p-5">
      <h1 className="font-bold text-xl">Welcome, Annette!</h1>
      <div className="grid grid-rows-2 p-5 gap-5 min-h-[80vh]">
        <div className=" p-5 bg-black/30 isolate  backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/5 mx-auto w-full h-full">
          <h1 className="font-bold text-sm">Recent Reservations</h1>
        </div>
        <div className=" p-5 bg-black/30 isolate  backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/5 mx-auto w-full h-full grid grid-cols-3">
          <h1 className="font-bold text-sm">Calendar</h1>
          <div id="recent-dates" className="grid grid-rows-6 gap-2">
            {getNextThreeDaysSkippingSaturday().map((date, index) => {
              return (
                <Link
                  href={
                    date.getFullYear() +
                    "/" +
                    (date.getMonth() + 1) +
                    "/" +
                    date.getDate()
                  }
                >
                  <div className="rounded-xl bg-black text-white text-center h-fit py-2">
                    <h1 className="">{date.toDateString()}</h1>
                  </div>
                </Link>
              );
            })}
          </div>
          <div id="calendar"></div>
        </div>
      </div>
    </div>
  );
}
