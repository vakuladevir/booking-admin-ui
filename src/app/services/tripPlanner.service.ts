import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TripPlannerVO } from '../model/tripPlannerVO.model';
import { GeneralRespVO } from '../model/generalRespVO.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripPlannerService {

  ROOT_URL: string = "http://localhost:5000";

  constructor(private http: HttpClient) { }

  // Create a single trip
  createTrip(trip: TripPlannerVO): Observable<TripPlannerVO> {
    trip.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
    trip.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    const url = this.ROOT_URL + '/bookingAdmin/tripPlanner/createTrip';
    return this.http.post<any>(url, trip);
  }

  // Create bulk trips
  createBulkTrips(trips: TripPlannerVO[]): Observable<TripPlannerVO[]> {
    const username = String(sessionStorage.getItem('UserInfo.username') || '');
    trips.forEach(trip => {
      trip.createdBy = username;
      trip.updatedBy = username;
    });
    const url = this.ROOT_URL + '/bookingAdmin/tripPlanner/bulkTrips';
    return this.http.post<any>(url, trips);
  }

  // Get all trips
  getAllTrips(): Observable<TripPlannerVO[]> {
    const url = this.ROOT_URL + '/bookingAdmin/tripPlanner/getAllTrips';
    return this.http.get<any>(`${url}`);
  }

  // Get trip by ID
  getTripById(tripPlannerId: number): Observable<TripPlannerVO> {
    // Mock implementation - replace with actual HTTP call
    const mockTrip = new TripPlannerVO();
    mockTrip.tripPlannerId = tripPlannerId;
    return of(mockTrip);
  }

  // Update trip
  updateTrip(trip: TripPlannerVO): Observable<GeneralRespVO> {
    // Mock implementation - replace with actual HTTP call
    const response: GeneralRespVO = {
      userName: 'Admin',
      message: 'Trip updated successfully',
      subMessage: 'Trip details have been updated',
      status: true
    };
    return of(response);
  }

  // Delete trip
  deleteTrip(tripPlannerId: number): Observable<GeneralRespVO> {
    const url = this.ROOT_URL + '/bookingAdmin/tripPlanner/deleteTrip/' + tripPlannerId;
    return this.http.get<any>(`${url}`);
  }

  // Calculate trip cost based on route and vehicle
  calculateTripCost(routeCode: string, vehicleId: number, tripType: string): Observable<{ tripCost: number, costPerSeat: number }> {
    // Mock implementation - replace with actual calculation logic
    const basePrice = 1000;
    const multiplier = tripType === 'roundtrip' ? 2 : 1;
    const tripCost = basePrice * multiplier;
    const costPerSeat = tripCost / 50; // Assuming 50 seats default

    return of({
      tripCost: tripCost,
      costPerSeat: costPerSeat
    });
  }

  // Update trip status
  updateTripStatus(tripPlannerId: number, tripStatus: string): Observable<GeneralRespVO> {
    const url = this.ROOT_URL + '/bookingAdmin/tripPlanner/updateTripStatus/' + tripPlannerId + '/' + tripStatus;
    return this.http.get<any>(`${url}`);
  }

}
