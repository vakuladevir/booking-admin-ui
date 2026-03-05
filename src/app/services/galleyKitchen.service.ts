import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GalleyKitchenVO } from '../model/galleyKitchenVO.model';

@Injectable({
    providedIn: 'root'
})
export class GalleyKitchenService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    createItem(vo: GalleyKitchenVO): Observable<string> {
        vo.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        vo.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        return this.http.post<string>(
            `${this.ROOT_URL}/bookingAdmin/galleyKitchen/createItem`,
            vo,
            { responseType: 'text' as 'json' }
        );
    }

    updateItem(itemId: number, vo: GalleyKitchenVO): Observable<string> {
        vo.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        vo.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        return this.http.post<string>(
            `${this.ROOT_URL}/bookingAdmin/galleyKitchen/updateItem/${itemId}`,
            vo,
            { responseType: 'text' as 'json' }
        );
    }

    deleteItem(itemId: number): Observable<string> {
        return this.http.get<string>(`${this.ROOT_URL}/bookingAdmin/galleyKitchen/deleteItem/${itemId}`, { responseType: 'text' as 'json' });
    }

    getAllItemsActive(): Observable<GalleyKitchenVO[]> {
        return this.http.get<GalleyKitchenVO[]>(`${this.ROOT_URL}/bookingAdmin/galleyKitchen/getAllItemsActive`);
    }

    getAllItems(): Observable<GalleyKitchenVO[]> {
        return this.http.get<GalleyKitchenVO[]>(`${this.ROOT_URL}/bookingAdmin/galleyKitchen/getAllItems`);
    }

    getAllItemNameActive(): Observable<string[]> {
        return this.http.get<string[]>(`${this.ROOT_URL}/bookingAdmin/galleyKitchen/getAllItemNameActive`);
    }
}
