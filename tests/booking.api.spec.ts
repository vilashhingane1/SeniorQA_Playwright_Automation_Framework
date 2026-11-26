import { expect, test } from '@playwright/test';
import bookingData from '../test-data/booking.json';
import { appConfig } from '../utils/app-config';
import { applications } from '../utils/applications';
import { requiredEnv } from '../utils/environment';

interface TokenResponse {
  token: string;
}

interface CreatedBooking {
  bookingid: number;
  booking: typeof bookingData.booking;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'token' in value &&
    typeof value.token === 'string'
  );
}

function isCreatedBooking(value: unknown): value is CreatedBooking {
  return (
    typeof value === 'object' &&
    value !== null &&
    'bookingid' in value &&
    typeof value.bookingid === 'number' &&
    'booking' in value
  );
}

test(
  'creates, reads, updates, and deletes a booking',
  { tag: [applications.restfulbooker.tags[0], '@smoke', '@regression'] },
  async ({ request }) => {
  const apiURL = (path: string): string => new URL(path, appConfig.bookerBaseURL).toString();
  const authResponse = await request.post(apiURL('/auth'), {
    data: {
      username: requiredEnv('RESTFUL_BOOKER_USERNAME'),
      password: requiredEnv('RESTFUL_BOOKER_PASSWORD'),
    },
    },
  );
  expect(authResponse).toBeOK();
  const authBody: unknown = await authResponse.json();
  expect(isTokenResponse(authBody)).toBe(true);
  if (!isTokenResponse(authBody)) {
    throw new Error('Restful-Booker auth response did not contain a token.');
  }

  const token = authBody.token;
  const createResponse = await request.post(apiURL('/booking'), { data: bookingData.booking });
  expect(createResponse).toBeOK();
  const createBody: unknown = await createResponse.json();
  expect(isCreatedBooking(createBody)).toBe(true);
  if (!isCreatedBooking(createBody)) {
    throw new Error('Restful-Booker create response did not contain a booking ID.');
  }

  const bookingId = createBody.bookingid;
  const authHeaders = { Cookie: `token=${token}` };
  try {
    const getResponse = await request.get(apiURL(`/booking/${bookingId}`));
    expect(getResponse).toBeOK();
    await expect(getResponse.json()).resolves.toMatchObject(bookingData.booking);

    const updatedBooking = {
      ...bookingData.booking,
      additionalneeds: 'Breakfast and airport transfer',
    };
    const updateResponse = await request.put(apiURL(`/booking/${bookingId}`), {
      data: updatedBooking,
      headers: authHeaders,
    });
    expect(updateResponse).toBeOK();
    await expect(updateResponse.json()).resolves.toMatchObject(updatedBooking);
  } finally {
    const deleteResponse = await request.delete(apiURL(`/booking/${bookingId}`), {
      headers: authHeaders,
    });
    expect(deleteResponse.status()).toBe(201);
  }

  const deletedResponse = await request.get(apiURL(`/booking/${bookingId}`));
  expect(deletedResponse.status()).toBe(404);
});
