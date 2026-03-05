import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { VehicleDetailsVO } from "../model/vehicleDetailsVO.model";
import { FleetMaintenanceVO } from "../model/fleetMaintenanceVO.model";


@Injectable({
    providedIn: 'root'
})
export class FleetService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }


    createFleet(fleetVO: FleetMaintenanceVO): Observable<any> {
        fleetVO.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        fleetVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/fleet/createFleetInfo';
        return this.http.post<any>(url, fleetVO);
    }

    
    updateFleet(fleetId: number, fleetVO: FleetMaintenanceVO): Observable<any> {
        fleetVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/fleet/updateFleet';
        return this.http.post<any>(`${url}/${fleetId}`, fleetVO);
    }

    deleteFleet(fleetId: number): Observable<string> {
        const url = this.ROOT_URL + '/bookingAdmin/fleet/delete';
        return this.http.get<string>(`${url}/${fleetId}`, { responseType: 'text' as 'json' });
    }

    getAllFleet() {
        return this.http.get<any>(this.ROOT_URL + '/bookingAdmin/fleet/getAllFleet');
    }

    getFleetById(fleetId: number): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/fleet';
        return this.http.get<any>(`${url}/${fleetId}`);
    }

    getAllFleetByBPNo(bpNo: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/fleet/getAllFleetByBPNo';
        return this.http.get<any>(`${url}/${bpNo}`);
    }

}