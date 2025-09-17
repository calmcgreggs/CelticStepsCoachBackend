import { supabase } from "@/lib/supabase";
import Booking from "@/types";
import Link from "next/link";

export default function BookingCard({
  booking,
  key,
  date,
  venue,
  confirmed,
  setBookings,
}: {
  booking: Booking;
  key: number;
  date: Date;
  venue: "Killarney" | "Tralee";
  confirmed: boolean;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}) {
  async function fetchDaysBookings() {
    const dateasnice =
      date.getFullYear().toString() +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0");
    const { data, error } = await supabase
      .from("Bookings")
      .select()
      .eq("Date", dateasnice)
      .eq("Venue", venue)
      .eq("Approved", confirmed);

    setBookings(data || []);
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
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
      fetchDaysBookings();
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
      fetchDaysBookings();
      sendEmail(booking, false);
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

  return (
    <div
      key={key}
      className="bg-black/30 isolate  backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/5 mx-auto w-full h-full my-2 p-5 flex flex-row justify-between"
    >
      <div className="flex flex-col">
        <h1 className="font-bold text-xl text-white">
          {booking.TourCompany} ({booking.ContactName}) -{" "}
          {booking.NumberOfGuests} Guests
        </h1>
        <h1 className="font-bold text-sm text-white">
          {new Date(booking.Date).toDateString()} - 8:30PM
        </h1>
        <h1 className="font-bold text-sm text-white">
          Contact Email:{" "}
          <Link href={"mailto:" + booking.ContactEmail} className="underline">
            {booking.ContactEmail}
          </Link>
        </h1>
      </div>
      {!booking.Approved && (
        <div
          id="options"
          className="float-right flex flex-row gap-5 pr-10 my-auto"
        >
          <button
            className="btn btn-success"
            onClick={() => handleApprove(booking)}
          >
            Approve
          </button>
          <button
            className="btn btn-error"
            onClick={() => handleReject(booking)}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
