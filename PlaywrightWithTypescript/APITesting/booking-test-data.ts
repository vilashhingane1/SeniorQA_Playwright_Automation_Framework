import { randomUUID } from 'node:crypto';
import type { Booking } from './booking-schemas';

export function createBookingTestData(): Booking {
  const uniqueId = randomUUID().slice(0, 8);

  return {
    firstname: `Api${uniqueId}`,
    lastname: 'Automation',
    totalprice: 245,
    depositpaid: true,
    bookingdates: {
      checkin: '2027-01-15',
      checkout: '2027-01-20',
    },
    additionalneeds: `Breakfast-${uniqueId}`,
  };
}
