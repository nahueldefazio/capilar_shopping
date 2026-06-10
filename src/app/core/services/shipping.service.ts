import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShippingCalculationResult } from '../models';
import { environment } from '../../../environments/environment';

export interface CalculateShippingPayload {
  province: string;
  city: string;
  postalCode?: string;
  items: { productId: string; quantity: number }[];
  deliveryMethod?: string;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  calculate(payload: CalculateShippingPayload): Observable<ShippingCalculationResult> {
    return this.http.post<ShippingCalculationResult>(`${this.base}/shipping/calculate`, payload);
  }
}
