import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripSeaterVO } from '../model/tripSeaterVO.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripSeaterService {
  private ROOT_URL: string = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // Get all seater details by tripPlannerId
  getByTripPlanner(tripPlannerId: number): Observable<TripSeaterVO[]> {
    return this.http.get<TripSeaterVO[]>(`${this.ROOT_URL}/bookingAdmin/tripSeater/getByTripPlanner/${tripPlannerId}`);
  }

  // Update all seaters for a tripPlannerId
  updateByTripPlanner(tripPlannerId: number, seaters: TripSeaterVO[]): Observable<TripSeaterVO[]> {
    return this.http.post<TripSeaterVO[]>(`${this.ROOT_URL}/bookingAdmin/tripSeater/updateByTripPlanner/${tripPlannerId}`, seaters);
  }

  // Delete all seaters for a tripPlannerId
  deleteByTripPlanner(tripPlannerId: number): Observable<string> {
    return this.http.delete<string>(`${this.ROOT_URL}/bookingAdmin/tripSeater/deleteByTripPlanner/${tripPlannerId}`);
  }
}
