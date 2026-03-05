import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoginInfoService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    userLogin(username: string, password: string): Observable<any> {
        return this.http.get<any>(this.ROOT_URL + '/bookingAdmin/login/validateUser?username=' + username + '&password=' + password);
    }

}