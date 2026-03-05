// src/app/services/route-map.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteMapVO } from '../model/routeMapVO.model';
import { StopMapVO } from '../model/stopMapVO.model';

@Injectable({
  providedIn: 'root'
})
export class StopMapService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

  constructor(private http: HttpClient) {}

  createStop(stop: StopMapVO): Observable<any> {
    stop.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
    stop.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post(`${this.ROOT_URL}/bookingAdmin/stopMap/createStopMap`, stop);
  }

  updateStop(stopMapId: number, stop: StopMapVO): Observable<any> {
    stop.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post(`${this.ROOT_URL}/bookingAdmin/stopMap/updateStopMap/${stopMapId}`, stop);
  }

  deleteStop(stopMapId: number): Observable<string> {
    return this.http.get(`${this.ROOT_URL}/bookingAdmin/stopMap/deleteStopMap/${stopMapId}`, { responseType: 'text' });
  }

   deleteAllStopByRouteMapId(routeMapId: number): Observable<string> {
    return this.http.get(`${this.ROOT_URL}/bookingAdmin/stopMap/deleteAll/${routeMapId}`, { responseType: 'text' });
  }

  getStopByRouteMapId(routeMapId: number): Observable<StopMapVO[]> {
    return this.http.get<any>(`${this.ROOT_URL}/bookingAdmin/stopMap/getStopMapByRoute/${routeMapId}`);
  }

}
