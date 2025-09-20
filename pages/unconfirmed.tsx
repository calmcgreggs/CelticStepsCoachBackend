import { supabase } from "@/lib/supabase";
import Booking from "@/types";
import { useEffect, useState } from "react";

export default function UnconfirmedBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  async function fetchUnconfirmedBookings() {
    const { data, error } = await supabase
      .from("Bookings")
      .select("*")
      .eq("Approved", false)
      .order("Timestamp", { ascending: false }); // newest first;

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
      fetchUnconfirmedBookings();
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
      fetchUnconfirmedBookings();
      sendEmail(booking, false);
    }
  }

  useEffect(() => {
    fetchUnconfirmedBookings();
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Bookings" },
        (payload) => {
          fetchUnconfirmedBookings();
        }
      )
      .subscribe();
  }, []);

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
    <div className="min-h-screen px-5">
      <h1 className="text-3xl font-bold text-center pt-10">
        Unconfirmed Bookings
      </h1>
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
  );
}
