import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { appConfig } from '../../utils/app-config';
import { requiredEnv } from '../../utils/environment';
import { authTokenSchema, createdBookingSchema, type Booking } from './booking-schemas';

export class RestfulBookerApiClient {
  private readonly trackedBookingIds = new Set<number>();
  private token = '';

  private constructor(private readonly context: APIRequestContext) {}

  static async createAuthenticated(): Promise<RestfulBookerApiClient> {
    const context = await request.newContext({
      baseURL: appConfig.bookerBaseURL,
      extraHTTPHeaders: { Accept: 'application/json' },
      timeout: 30_000,
    });
    const client = new RestfulBookerApiClient(context);

    try {
      await client.authenticate();
      return client;
    } catch (error) {
      await client.dispose();
      throw error;
    }
  }

  async authenticate(): Promise<void> {
    const response = await this.context.post('/auth', {
      data: {
        username: requiredEnv('RESTFUL_BOOKER_USERNAME'),
        password: requiredEnv('RESTFUL_BOOKER_PASSWORD'),
      },
    });
    if (response.status() !== 200) {
      throw new Error(`Restful-Booker authentication failed with status ${response.status()}.`);
    }

    const tokenResult = authTokenSchema.safeParse(await response.json());
    if (!tokenResult.success) {
      throw new Error(`Restful-Booker returned an invalid auth response: ${tokenResult.error.message}`);
    }
    this.token = tokenResult.data.token;
  }

  async createBooking(booking: Booking): Promise<{ bookingid: number; booking: Booking }> {
    const response = await this.postBooking(booking);
    if (response.status() !== 200) {
      throw new Error(`Restful-Booker booking creation failed with status ${response.status()}.`);
    }

    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'bookingid' in body &&
      typeof body.bookingid === 'number') {
      this.trackedBookingIds.add(body.bookingid);
    }

    const result = createdBookingSchema.safeParse(body);
    if (!result.success) {
      throw new Error(`Restful-Booker returned an invalid booking response: ${result.error.message}`);
    }
    return result.data;
  }

  postBooking(payload: unknown): Promise<APIResponse> {
    return this.context.post('/booking', { data: payload });
  }

  getBooking(bookingId: number): Promise<APIResponse> {
    return this.context.get(`/booking/${bookingId}`);
  }

  putBooking(bookingId: number, booking: Booking, token = this.token): Promise<APIResponse> {
    return this.context.put(`/booking/${bookingId}`, {
      data: booking,
      headers: this.authHeaders(token),
    });
  }

  patchBooking(
    bookingId: number,
    changes: Partial<Booking>,
    token = this.token,
  ): Promise<APIResponse> {
    return this.context.patch(`/booking/${bookingId}`, {
      data: changes,
      headers: this.authHeaders(token),
    });
  }

  async deleteBooking(bookingId: number, token = this.token): Promise<APIResponse> {
    const response = await this.context.delete(`/booking/${bookingId}`, {
      headers: this.authHeaders(token),
    });
    if (response.status() === 201) {
      this.trackedBookingIds.delete(bookingId);
    }
    return response;
  }

  async cleanupTrackedBookings(): Promise<void> {
    for (const bookingId of this.trackedBookingIds) {
      const existing = await this.getBooking(bookingId);
      if (existing.status() === 404) {
        this.trackedBookingIds.delete(bookingId);
        continue;
      }
      if (existing.status() !== 200) {
        throw new Error(
          `Could not check fixture booking ${bookingId} during cleanup (status ${existing.status()}).`,
        );
      }

      const deleted = await this.deleteBooking(bookingId);
      if (deleted.status() !== 201) {
        throw new Error(
          `Could not delete fixture booking ${bookingId} (status ${deleted.status()}).`,
        );
      }
    }
  }

  dispose(): Promise<void> {
    return this.context.dispose();
  }

  private authHeaders(token: string): Record<string, string> {
    if (!token) {
      throw new Error('Authenticate before making a booking change.');
    }
    return { Cookie: `token=${token}` };
  }
}
