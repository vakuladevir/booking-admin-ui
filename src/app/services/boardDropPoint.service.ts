// src/app/services/boardDropPoint.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardDropPointVO } from '../model/boardDropPointVO.model';

@Injectable({
  providedIn: 'root'
})
export class BoardDropPointService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

  constructor(private http: HttpClient) {}

  createBoardDrop(boardDrop: BoardDropPointVO): Observable<BoardDropPointVO> {
    boardDrop.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
    boardDrop.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post<BoardDropPointVO>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/createBoardDrop`, boardDrop);
  }

  createAllBoardDropPoint(boardDropList: BoardDropPointVO[]): Observable<void> {
    const username = String(sessionStorage.getItem('UserInfo.username') + "");
    boardDropList.forEach(drop => {
      drop.createdBy = username;
      drop.updatedBy = username;
    });
    return this.http.post<void>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/createAllBoardDrop`, boardDropList);
  }

  updateBoardDrop(pointId: number, boardDrop: BoardDropPointVO): Observable<BoardDropPointVO> {
    boardDrop.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
    return this.http.post<BoardDropPointVO>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/updateBoardDrop/${pointId}`, boardDrop);
  }

  updateAllBoardDrop(routeId: number, placeId: number, boardDropList: BoardDropPointVO[]): Observable<void> {
    return this.http.post<void>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/updateAllBoardDrp/${routeId}/${placeId}`, boardDropList);
  }

  deleteBoardDrop(pointId: number): Observable<string> {
    return this.http.get(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/deleteBoardDrop/${pointId}`, { responseType: 'text' });
  }

  deleteAllBoardDropByRouteId(routeId: number, placeId: number): Observable<string> {
    return this.http.get(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/deleteAllBoardDrop/${routeId}/${placeId}`, { responseType: 'text' });
  }

  viewAllBoardDrop(): Observable<BoardDropPointVO[]> {
    return this.http.get<BoardDropPointVO[]>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/viewAllBoardDrop`);
  }

  viewAllBoardDropByRouteId(routeId: number, placeId: number): Observable<BoardDropPointVO[]> {
    return this.http.get<BoardDropPointVO[]>(`${this.ROOT_URL}/bookingAdmin/boardDropPoint/viewAllBoardDrop/${routeId}/${placeId}`);
  }

}
