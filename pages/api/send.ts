// pages/api/send.ts
import Booking from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

type ResponseData = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { booking, approved } = req.body as {
      booking: Booking;
      approved: boolean;
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // use the 16-char app password
      },
    });

    await transporter.sendMail({
      from: '"Celtic Steps Coach Bookings" <celticstepscoachbookings@gmail.com>',
      to: booking.ContactEmail,
      subject: "Booking " + (approved ? "Approved" : "Rejected"),
      html:
        "<p>Hello " +
        booking.ContactName +
        "</p> <br /> <p>Your booking for " +
        booking.NumberOfGuests +
        " guests on " +
        new Date(booking.Date).toDateString() +
        " for Celtic Steps The Show : " +
        booking.Venue +
        " has been " +
        (approved
          ? "approved. Your Booking Confirmation Number is #" +
            booking.id +
            ". Doors open at 7:45pm for an 8:30pm show. Please arrive as early as possible to ensure timely entry."
          : "rejected due to insufficient capacity. If you would like more information, please contact the Box Office.") +
        "</p> <br /> <p>Thank you for choosing Celtic Steps Coach Bookings.</p> <br /> <p>Best Regards,</p> <p>Celtic Steps Coach Bookings Team</p>",
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
