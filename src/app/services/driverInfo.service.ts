import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PartnerBankVO } from "../model/partnerBankVO.model";
import { VehicleDetailsVO } from "../model/vehicleDetailsVO.model";
import { DriverInfoVO } from "../model/driverInfoVO.model";


@Injectable({
    providedIn: 'root'
})
export class DriverInfoService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    getAllDrivers(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/drivers/allDrivers';
        return this.http.get<any>(`${url}`);
    }

    createDriver(driverInfoVO: DriverInfoVO): Observable<any> {
        driverInfoVO.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        driverInfoVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/drivers/createDriver';
        return this.http.post<any>(url, driverInfoVO);
    }

    getAllDriverCodes(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/drivers/getAllDriverCodes';
        return this.http.get<any>(`${url}`);
    }

    getDriverByCode(driverCode: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/drivers/search';
        return this.http.get<any>(`${url}/${driverCode}`);
    }

    getDriverById(driverId: number): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/drivers/search/id';
        return this.http.get<any>(`${url}/${driverId}`);
    }


    updateDriver(driverCode: string, driverInfoVO: DriverInfoVO): Observable<any> {
        driverInfoVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/drivers/updateDriver';
        return this.http.post<any>(`${url}/${driverCode}`, driverInfoVO);
    }

    deleteDriver(driverCode: string): Observable<string> {
        const url = this.ROOT_URL + '/bookingAdmin/drivers/deleteDriver';
        return this.http.get<string>(`${url}/${driverCode}`, { responseType: 'text' as 'json' });
    }




}