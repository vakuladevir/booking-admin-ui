// src/app/services/route-map.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RouteMapVO } from '../model/routeMapVO.model';

@Injectable({
  providedIn: 'root'
})
export class RouteMapService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

  constructor(private http: HttpClient) {}

  createRoute(route: RouteMapVO): Observable<any> {
    route.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
    route.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post(`${this.ROOT_URL}/bookingAdmin/routeMap/createRouteMap`, route);
  }

  updateRoute(routeCode: string, route: RouteMapVO): Observable<any> {
    route.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post(`${this.ROOT_URL}/bookingAdmin/routeMap/updateRouteMap/${routeCode}`, route);
  }

  deleteRoute(routeCode: string): Observable<string> {
    return this.http.get(`${this.ROOT_URL}/bookingAdmin/routeMap/deleteRouteMap/${routeCode}`, { responseType: 'text' });
  }

  getRouteByCode(routeCode: string): Observable<RouteMapVO> {
    return this.http.get<any>(`${this.ROOT_URL}/bookingAdmin/routeMap/getByRouteCode/${routeCode}`);
  }

  getAllRoutes(): Observable<RouteMapVO[]> {
    return this.http.get<any>(`${this.ROOT_URL}/bookingAdmin/routeMap/getAllRoutes`);
  }

  getAllRouteCode(): Observable<any> {
    const url = this.ROOT_URL + '/bookingAdmin/routeMap/getAllRouteCode';
    return this.http.get<any>(`${url}`);
  }

  getAllLocation(): Observable<any> {
    const url = this.ROOT_URL + '/bookingAdmin/routes/getAllLocation';
    return this.http.get<any>(`${url}`);
  }

  getAllRoute(): Observable<any> {
    const url = this.ROOT_URL + '/bookingAdmin/routes/getAllRoute';
    return this.http.get<any>(`${url}`);
  }

}
