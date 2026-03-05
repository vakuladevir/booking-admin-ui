import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PartnerMasterVO } from "../model/partnerMasterVO.model";

@Injectable({
    providedIn: 'root'
})
export class ParnterMasterService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    
    createPartner(partner: PartnerMasterVO): Observable<any> {
        partner.createdBy = String(sessionStorage.getItem('UserInfo.username')+"");
        partner.updatedBy = String(sessionStorage.getItem('UserInfo.username')+"");
        const url = this.ROOT_URL + '/bookingAdmin/partnerMaster/createPartner';
        return this.http.post<any>(url, partner);
    }

    getPartnerByBpNo(bpNo: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerMaster/search';
        return this.http.get<any>(`${url}/${bpNo}`);
    }

    getAllBpNo(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerMaster/getAllBpNo';
        return this.http.get<any>(`${url}`);
    }
    
    updatePartner(bpNo: string, partner: PartnerMasterVO): Observable<any> {
        partner.updatedBy = String(sessionStorage.getItem('UserInfo.username')+"");
        const url = this.ROOT_URL + '/bookingAdmin/partnerMaster/updatePartner';
        return this.http.post<any>(`${url}/${bpNo}`, partner);
    }

    deletePartner(bpNo: string): Observable<string> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerMaster/deletePartner';
        return this.http.get<string>(`${url}/${bpNo}`, { responseType: 'text' as 'json' });
    }

    getAllPartner() {
        return this.http.get<any>(this.ROOT_URL + '/bookingAdmin/partnerMaster/listPartner');
    }

}