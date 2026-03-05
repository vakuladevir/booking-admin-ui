import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { GkItemCategoryVO } from '../model/gkItemCategoryVO.model'; // Uncomment and create this model if needed

@Injectable({
    providedIn: 'root'
})
export class GkItemCategoryService {
    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    getAllCategoryName(): Observable<string[]> {
        return this.http.get<string[]>(`${this.ROOT_URL}/bookingAdmin/gkItemCategory/getAllCategoryName`);
    }

    getAllCategory(): Observable<any[]> { // Replace any[] with GkItemCategoryVO[] if model exists
        return this.http.get<any[]>(`${this.ROOT_URL}/bookingAdmin/gkItemCategory/getAllCategory`);
    }

    createCategory(vo: any): Observable<any> { // Replace any with GkItemCategoryVO if model exists
        return this.http.post(`${this.ROOT_URL}/bookingAdmin/gkItemCategory/createCategory`, vo, { responseType: 'text' });
    }

    deleteCategoryByName(categoryName: string): Observable<void> {
        return this.http.get<void>(`${this.ROOT_URL}/bookingAdmin/gkItemCategory/deleteCategoryByName/${encodeURIComponent(categoryName)}`);
    }
}
