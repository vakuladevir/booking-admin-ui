import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PartnerBankVO } from "../model/partnerBankVO.model";


@Injectable({
    providedIn: 'root'
})
export class ParnterBankService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    getPartnerBankByBPCode(bpNo: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerBank/bp';
        return this.http.get<any>(`${url}/${bpNo}`);
    }

    createBank(bpNo: string, partnerBank: PartnerBankVO): Observable<any> {
        partnerBank.createdBy = String(sessionStorage.getItem('UserInfo.username')+"");
        partnerBank.updatedBy = String(sessionStorage.getItem('UserInfo.username')+"");
        const url = this.ROOT_URL + '/bookingAdmin/partnerBank/createBank';
        return this.http.post<any>(`${url}/${bpNo}`, partnerBank);
    }

    updateBank(bpNo: string, partnerBank: PartnerBankVO): Observable<any> {
        partnerBank.updatedBy = String(sessionStorage.getItem('UserInfo.username')+"");
        const url = this.ROOT_URL + '/bookingAdmin/partnerBank/updateBank';
        return this.http.post<any>(`${url}/${bpNo}`, partnerBank);
    }

    deleteBank(bpNo: string): Observable<string> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerBank/deleteBank';
        return this.http.get<string>(`${url}/${bpNo}`, { responseType: 'text' as 'json' });
    }

    getAllBankDetails(): Observable<PartnerBankVO[]> {
        const url = this.ROOT_URL + '/bookingAdmin/partnerBank/getAllBankDetails';
        return this.http.get<PartnerBankVO[]>(url);
    }

}