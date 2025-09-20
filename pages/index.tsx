import { supabase } from "@/lib/supabase";
import Booking from "@/types";
import { useUser } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState<Date | undefined>();
  const router = useRouter();
  const [today, setToday] = useState<Booking[]>([]);

  useEffect(() => {
    fetchLastFiveBookings();
    getTodaysBookings();
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Bookings" },
        (payload) => {
          fetchLastFiveBookings();
          getTodaysBookings();
        }
      )
      .subscribe();
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

  async function handleApprove(booking: Booking) {
    const { data, error } = await supabase
      .from("Bookings")
      .update({ Approved: true })
      .eq("id", booking.id)
      .select();
    if (error) {
      console.error("Error approving Booking:", error);
    } else {
      console.log("Booking approved successfully:", data);
      fetchLastFiveBookings();
      sendEmail(booking, true);
    }

    // Send Email to user saying booking approved
  }
  async function handleReject(booking: Booking) {
    // Send Email to user saying booking rejected
    const { data, error } = await supabase
      .from("Bookings")
      .delete()
      .eq("id", booking.id)
      .select();
    if (error) {
      console.error("Error rejecting Booking:", error);
    } else {
      console.log("Booking rejected successfully:", data);
      fetchLastFiveBookings();
      sendEmail(booking, false);
    }
  }

  async function fetchLastFiveBookings() {
    const { data, error } = await supabase
      .from("Bookings")
      .select("*")
      .eq("Approved", false)
      .order("Timestamp", { ascending: false }) // newest first
      .limit(5);

    if (error) {
      console.error(error);
    } else {
      if (data.length > 0) {
        const recentBookings: Booking[] = [];
        data.forEach((entry) => {
          recentBookings.push({
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
        setBookings(recentBookings);
      } else {
        setBookings([]);
      }
    }
  }

  function isntSat(date: Date) {
    return date.getDay() !== 6;
  }

  function getNextThreeDaysSkippingSaturday() {
    const result = [];
    const date = new Date();

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

  async function getTodaysBookings() {
    const { data, error } = await supabase
      .from("Bookings")
      .select()
      .eq("Date", new Date().toISOString().split("T")[0]);
    if (error) {
      console.error(error);
    } else {
      if (data.length > 0) {
        const recentBookings: Booking[] = [];
        data.forEach((entry) => {
          recentBookings.push({
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
        setToday(recentBookings);
      } else {
        setToday([]);
      }
    }
  }

  async function sendEmail(booking: Booking, approved: boolean) {
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking, approved }),
    });

    const data: { success: boolean; error?: string } = await res.json();

    alert(data.success ? "Email sent!" : `Failed: ${data.error}`);
  }

  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen relative flex-col">
        <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="loading loading-bars loading-xl"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900 p-5">
      <h1 className="font-bold text-xl">Welcome, {user.firstName}!</h1>
      <div className="grid grid-rows-2 p-5 gap-5 min-h-[80vh]">
        <div className=" p-5 bg-black/30 isolate  backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/5 mx-auto w-full h-full">
          <Link href="/unconfirmed">
            <h1 className="font-bold text-sm underline">Recent Reservations</h1>
          </Link>
          {bookings.length === 0 && (
            <h1 className="text-white mt-5 text-2xl text-center">
              No unconfirmed bookings
            </h1>
          )}
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white/10 p-3 my-3 rounded-lg shadow-md flex flex-row justify-between"
            >
              <div className="flex flex-row gap-5">
                <h1 className="font-bold text-sm">
                  {booking.ContactName} - {booking.Venue} -{" "}
                  {new Date(booking.Date).toDateString()}
                </h1>
                <h1 className="font-bold text-sm">
                  Tour Company: {booking.TourCompany}
                </h1>
                <h1 className="font-bold text-sm">
                  {booking.NumberOfGuests} Guests
                </h1>
              </div>
              <div
                id="options"
                className="float-right flex flex-row gap-5 pr-10 my-auto"
              >
                <button
                  className="btn btn-success h-fit"
                  onClick={() => handleApprove(booking)}
                >
                  Approve
                </button>
                <button
                  className="btn btn-error h-fit"
                  onClick={() => handleReject(booking)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className=" p-5 bg-black/30 isolate  backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/5 mx-auto w-full h-full grid grid-cols-3 [&>*]:border-l-2 [&>*]:border-l-white/20 [&>*]:px-4">
          <div className="flex flex-col gap-10">
            <h1 className="font-bold text-sm text-center underline">
              Pick a date below to view bookings
            </h1>
            <div id="calendar" className="mx-auto w-fit ">
              <DatePicker
                selected={date}
                value={
                  new Date().getFullYear() +
                  "-" +
                  (new Date().getMonth() + 1).toString().padStart(2, "0") +
                  "-" +
                  new Date().getDate().toString().padStart(2, "0")
                }
                onChange={(d: Date | null) => {
                  router.push(
                    "/" +
                      (d ? d.getFullYear() : new Date().getFullYear()) +
                      "/" +
                      (d ? d.getMonth() + 1 : new Date().getMonth() + 1) +
                      "/" +
                      (d ? d.getDate() : new Date().getDate())
                  );
                  setDate(d || new Date());
                }}
                placeholderText="Select a date"
                minDate={new Date()}
                maxDate={new Date(new Date().getFullYear(), 9, 17)} // October is month 9 (0-indexed)
                dateFormat="yyyy-MM-dd"
                filterDate={isntSat}
                className="input input-bordered max-w-xs w-fit bg-black"
              />
            </div>
          </div>
          <div className="flex flex-col gap-5 text-center">
            <h1 className="font-bold text-sm text-center mb-10 underline">
              Today At A Glance
            </h1>
            <div className="p-5 mx-auto bg-black flex flex-col gap-5 rounded-xl text-white">
              <h1 className=" text-sm">
                Killarney Show Coach Bookings -{" "}
                {
                  today.filter((a: Booking) => {
                    return a.Venue == "Killarney" && a.Approved == true;
                  }).length
                }
              </h1>
              <h1 className=" text-sm">
                Killarney Show Coach Guests -{" "}
                {today
                  .filter((a: Booking) => {
                    return a.Venue == "Killarney" && a.Approved == true;
                  })
                  .reduce((total, b) => total + b.NumberOfGuests, 0)}
              </h1>
              <h1 className=" text-sm">
                Tralee Show Coach Bookings -{" "}
                {
                  today.filter((a: Booking) => {
                    return a.Venue == "Tralee" && a.Approved == true;
                  }).length
                }
              </h1>
              <h1 className=" text-sm">
                Tralee Show Coach Guests -{" "}
                {today
                  .filter((a: Booking) => {
                    return a.Venue == "Tralee" && a.Approved == true;
                  })
                  .reduce((total, b) => total + b.NumberOfGuests, 0)}
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-5 text-center border-r-2 border-r-white/20">
            <h1 className="font-bold text-sm text-center mb-0 underline">
              Quick Select A Date
            </h1>
            <div id="recent-dates" className="grid grid-rows-6 gap-2">
              {getNextThreeDaysSkippingSaturday().map((date, index) => {
                return (
                  <Link
                    key={index}
                    href={
                      date.getFullYear() +
                      "/" +
                      (date.getMonth() + 1) +
                      "/" +
                      date.getDate()
                    }
                  >
                    <div className="rounded-xl bg-black text-white text-center h-fit py-1">
                      <h1 className="">{date.toDateString()}</h1>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
