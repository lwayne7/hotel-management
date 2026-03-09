import { Injectable } from '@nestjs/common';
import { Observable, Subject, interval, merge, of, map } from 'rxjs';

export type HotelPriceChangeKind =
  | 'price_changed'
  | 'hotel_updated'
  | 'hotel_online'
  | 'hotel_offline'
  | 'hotel_hidden'
  | 'keepalive';

export interface HotelPriceUpdateEvent {
  type: 'hotel_price_update';
  timestamp: number;
  hotelId?: number;
  changeKind: HotelPriceChangeKind;
  version?: number;
}

@Injectable()
export class PriceUpdatesService {
  private readonly events$ = new Subject<HotelPriceUpdateEvent>();
  private version = 0;

  emit(changeKind: HotelPriceChangeKind, hotelId?: number): void {
    this.events$.next(this.buildEvent(changeKind, hotelId));
  }

  stream(): Observable<HotelPriceUpdateEvent> {
    return merge(
      of(this.buildEvent('keepalive')),
      this.events$.asObservable(),
      interval(30_000).pipe(map(() => this.buildEvent('keepalive'))),
    );
  }

  private buildEvent(
    changeKind: HotelPriceChangeKind,
    hotelId?: number,
  ): HotelPriceUpdateEvent {
    return {
      type: 'hotel_price_update',
      timestamp: Date.now(),
      hotelId,
      changeKind,
      version: ++this.version,
    };
  }
}
