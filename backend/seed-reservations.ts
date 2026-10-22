import "dotenv/config";
import { db } from "./db";
import { reservations } from "@shared/schema";

async function seed() {
  console.log("Seeding reservations...");

  await db.insert(reservations).values([
    {
      guestName: "Eleanor Voss",
      guestEmail: "eleanor.voss@example.com",
      destination: "Casa Nera",
      checkIn: "2024-06-10",
      checkOut: "2024-06-17",
      guests: 2,
      status: "confirmed",
    },
    {
      guestName: "James Hartley",
      guestEmail: "j.hartley@example.com",
      destination: "Hoshinoya",
      checkIn: "2024-07-03",
      checkOut: "2024-07-08",
      guests: 1,
      status: "confirmed",
    },
    {
      guestName: "Marta Lindqvist",
      guestEmail: "marta.l@example.com",
      destination: "The Bracken",
      checkIn: "2024-08-14",
      checkOut: "2024-08-21",
      guests: 4,
      status: "cancelled",
    },
    {
      guestName: "Theo Nakamura",
      guestEmail: "theo.n@example.com",
      destination: "Casa Nera",
      checkIn: "2024-09-01",
      checkOut: "2024-09-05",
      guests: 2,
      status: "confirmed",
    },
    {
      guestName: "Isabelle Fontaine",
      guestEmail: "isabelle.f@example.com",
      destination: "Hoshinoya",
      checkIn: "2024-10-20",
      checkOut: "2024-10-27",
      guests: 2,
      status: "confirmed",
    },
  ]);

  console.log("Done seeding reservations.");
}

seed().catch(console.error);