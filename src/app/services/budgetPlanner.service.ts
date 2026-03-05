import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BudgetPlannerVO } from "../model/budgetPlannerVO.model";


@Injectable({
    providedIn: 'root'
})
export class BudgetPlannerService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient) { }

    createBudget(budgetPlannerVO: BudgetPlannerVO): Observable<any> {
        budgetPlannerVO.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        budgetPlannerVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/budgetPlanner/createBudget';
        return this.http.post<any>(url, budgetPlannerVO);
    }

    // Get all unique BudgetGenIds
    getAllUniqueBudgetGenIds(): Observable<string[]> {
        const url = this.ROOT_URL + '/bookingAdmin/budgetPlanner/uniqueBudgetGenIds';
        return this.http.get<string[]>(url);
    }

    // Fetch all versions for a BudgetGenID
    getAllVersionsByBudgetGenId(budgetGenId: string): Observable<BudgetPlannerVO[]> {
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/versions/${budgetGenId}`;
        return this.http.get<BudgetPlannerVO[]>(url);
    }

    // Fetch a specific budget by ID
    getBudgetById(budgetId: number): Observable<BudgetPlannerVO> {
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/getBudget/${budgetId}`;
        return this.http.get<BudgetPlannerVO>(url);
    }

    // Get budget by BudgetGenId and version
    getBudgetByGenIdAndVersion(budgetGenId: string, budgetVersion: number): Observable<BudgetPlannerVO> {
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/byGenIdAndVersion/${budgetGenId}/${budgetVersion}`;
        return this.http.get<BudgetPlannerVO>(url);
    }

    // Update existing budget
    updateBudget(budgetId: number, budgetPlannerVO: BudgetPlannerVO): Observable<BudgetPlannerVO> {
        const username = String(sessionStorage.getItem('UserInfo.username') ?? '');
        budgetPlannerVO.updatedBy = username;
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/updateBudget/${budgetId}`;
        return this.http.post<BudgetPlannerVO>(url, budgetPlannerVO);
    }

    // Delete budget
    deleteBudget(budgetId: number): Observable<any> {
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/deleteBudget/${budgetId}`;
        return this.http.get<any>(url);
    }

    // Fetch latest version for a BudgetGenID
    getLatestVersionByBudgetGenId(budgetGenId: string): Observable<BudgetPlannerVO> {
        const url = this.ROOT_URL + `/bookingAdmin/budgetPlanner/latestVersion/${budgetGenId}`;
        return this.http.get<BudgetPlannerVO>(url);
    }
}