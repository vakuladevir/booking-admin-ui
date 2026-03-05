
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoutePlaceVO } from '../model/routePlaceVO.model';
import { GeneralRespVO } from '../model/generalRespVO.model';

@Injectable({
  providedIn: 'root'
})
export class RoutePlaceService {
  ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";
    baseUrl: string = `${this.ROOT_URL}/bookingAdmin/routePlace`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RoutePlaceVO[]> {
    return this.http.get<RoutePlaceVO[]>(`${this.baseUrl}/getAll`);
  }

  getAllByRouteId(routeId: number): Observable<RoutePlaceVO[]> {
    return this.http.get<RoutePlaceVO[]>(`${this.baseUrl}/getAllByRouteId/${routeId}`);
  }

  create(place: RoutePlaceVO): Observable<GeneralRespVO> {
    place.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
    place.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post<GeneralRespVO>(`${this.baseUrl}/create`, place);
  }

  update(placeId: number, place: RoutePlaceVO): Observable<GeneralRespVO> {
    place.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post<GeneralRespVO>(`${this.baseUrl}/update/${placeId}`, place);
  }

  softDelete(placeId: number, updatedBy: string): Observable<GeneralRespVO> {
    const params = new HttpParams().set('updatedBy', updatedBy);
    return this.http.post<GeneralRespVO>(`${this.baseUrl}/softDelete/${placeId}`, null, { params });
  }

  softDeleteAllByRouteId(routeId: number, updatedBy: string): Observable<GeneralRespVO> {
    const params = new HttpParams().set('updatedBy', updatedBy);
    return this.http.post<GeneralRespVO>(`${this.baseUrl}/softDeleteAllByRouteId/${routeId}`, null, { params });
  }
}
