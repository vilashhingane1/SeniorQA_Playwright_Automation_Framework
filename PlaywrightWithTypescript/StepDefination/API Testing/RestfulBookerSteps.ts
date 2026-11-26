import assert from 'node:assert/strict';
import {
  After,
  Before,
  Given,
  Then,
  When,
  World,
} from '@cucumber/cucumber';
import type { APIResponse } from '@playwright/test';
import { createBookingTestData } from '../../APITesting/booking-test-data';
import { bookingSchema, type Booking } from '../../APITesting/booking-schemas';
import { RestfulBookerApiClient } from '../../APITesting/RestfulBookerApiClient';

interface RestfulBookerWorld extends World {
  apiClient?: RestfulBookerApiClient;
  bookingId?: number;
  booking?: Booking;
  latestResponse?: APIResponse;
}

function apiClient(world: RestfulBookerWorld): RestfulBookerApiClient {
  if (!world.apiClient) {
    throw new Error('Restful-Booker API client was not initialized.');
  }
  return world.apiClient;
}

function fixtureBookingId(world: RestfulBookerWorld): number {
  if (world.bookingId === undefined) {
    throw new Error('Restful-Booker fixture booking was not created.');
  }
  return world.bookingId;
}

async function responseBooking(response: APIResponse): Promise<Booking> {
  assert.equal(response.status(), 200, 'Expected a successful booking response.');
  return bookingSchema.parse(await response.json());
}

Before({ tags: '@restfulbooker' }, async function (this: RestfulBookerWorld) {
  this.apiClient = await RestfulBookerApiClient.createAuthenticated();
  this.booking = createBookingTestData();
  const created = await this.apiClient.createBooking(this.booking);
  this.bookingId = created.bookingid;
  assert.deepEqual(created.booking, this.booking);
});

After({ tags: '@restfulbooker' }, async function (this: RestfulBookerWorld) {
  if (!this.apiClient) {
    return;
  }

  try {
    await this.apiClient.cleanupTrackedBookings();
  } finally {
    await this.apiClient.dispose();
  }
});

Given('a fresh authenticated booking fixture exists', function (this: RestfulBookerWorld) {
  assert.ok(this.apiClient, 'Expected an authenticated API client.');
  assert.ok(this.booking, 'Expected a newly created booking fixture.');
  assert.ok(this.bookingId, 'Expected the fixture booking to have an ID.');
});

When('I retrieve the fixture booking', async function (this: RestfulBookerWorld) {
  this.latestResponse = await apiClient(this).getBooking(fixtureBookingId(this));
});

Then('the booking response matches the schema', async function (this: RestfulBookerWorld) {
  const booking = await responseBooking(this.latestResponse!);
  assert.deepEqual(booking, this.booking);
});

When('I replace the fixture booking', async function (this: RestfulBookerWorld) {
  const replacement = {
    ...this.booking!,
    firstname: `Updated${this.booking!.firstname}`,
    additionalneeds: 'PUT replacement',
  };
  this.booking = replacement;
  this.latestResponse = await apiClient(this).putBooking(fixtureBookingId(this), replacement);
});

Then('the booking reflects the replacement', async function (this: RestfulBookerWorld) {
  const updated = await responseBooking(this.latestResponse!);
  assert.deepEqual(updated, this.booking);
});

When('I patch the fixture booking', async function (this: RestfulBookerWorld) {
  this.booking = { ...this.booking!, additionalneeds: 'PATCH update' };
  this.latestResponse = await apiClient(this).patchBooking(fixtureBookingId(this), {
    additionalneeds: this.booking.additionalneeds,
  });
});

Then('the booking reflects the patch', async function (this: RestfulBookerWorld) {
  const updated = await responseBooking(this.latestResponse!);
  assert.deepEqual(updated, this.booking);
});

When('I delete the fixture booking', async function (this: RestfulBookerWorld) {
  this.latestResponse = await apiClient(this).deleteBooking(fixtureBookingId(this));
});

Then('the booking no longer exists', async function (this: RestfulBookerWorld) {
  assert.equal(this.latestResponse?.status(), 201, 'Expected the booking to be deleted.');
  const response = await apiClient(this).getBooking(fixtureBookingId(this));
  assert.equal(response.status(), 404, 'Expected the deleted booking to be absent.');
});

When('I update the fixture booking with an invalid token', async function (this: RestfulBookerWorld) {
  this.latestResponse = await apiClient(this).putBooking(
    fixtureBookingId(this),
    this.booking!,
    'invalid-token',
  );
});

Then('the update is rejected as forbidden', function (this: RestfulBookerWorld) {
  assert.equal(this.latestResponse?.status(), 403);
});

When('I submit an invalid booking payload', async function (this: RestfulBookerWorld) {
  this.latestResponse = await apiClient(this).postBooking({});
});

Then('the invalid payload is rejected', function (this: RestfulBookerWorld) {
  assert.ok(
    this.latestResponse && this.latestResponse.status() >= 400,
    'Expected the invalid payload to be rejected with a client or server error.',
  );
});

When('I retrieve a non-existent booking', async function (this: RestfulBookerWorld) {
  this.latestResponse = await apiClient(this).getBooking(2_147_483_647);
});

Then('the booking is not found', function (this: RestfulBookerWorld) {
  assert.equal(this.latestResponse?.status(), 404);
});
