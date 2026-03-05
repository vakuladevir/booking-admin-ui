import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, forkJoin, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { PartnerBankVO } from "../model/partnerBankVO.model";
import { VehicleDetailsVO } from "../model/vehicleDetailsVO.model";
import { FleetMaintenanceVO } from "../model/fleetMaintenanceVO.model";
import { FleetService } from "./fleet.service";


@Injectable({
    providedIn: 'root'
})
export class VehicleService {

    ROOT_URL: string = "http://localhost:5000";
    ROOT_URL_SERVER: string = "http://flickzz.ap-south-1.elasticbeanstalk.com";

    constructor(private http: HttpClient, private fleetService: FleetService) { }

    getAllVtypeNames(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/vtypes/getAllVTypeNames';
        return this.http.get<any>(`${url}`);
    }

    getByVTypeName(vTypeName: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/vtypes/search';
        return this.http.get<any>(`${url}/${vTypeName}`);
    }

    getAllVTypes(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/vtypes/getAllVTypes';
        return this.http.get<any>(`${url}`);
    }

    createVehicle(vehicleVO: VehicleDetailsVO): Observable<any> {
        vehicleVO.createdBy = String(sessionStorage.getItem('UserInfo.username') + "");
        vehicleVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/vehicles/createVehicle';
        return this.http.post<any>(url, vehicleVO);
    }

    getAllVehicleCodes(): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/vehicles/getAllVehicleCodes';
        return this.http.get<any>(`${url}`);
    }

    getVehicleByCode(vehicleCode: string): Observable<any> {
        const url = this.ROOT_URL + '/bookingAdmin/vehicles/search';
        return this.http.get<any>(`${url}/${vehicleCode}`);
    }

    updateVehicle(vehicleCode: string, vehicleVO: VehicleDetailsVO): Observable<any> {
        vehicleVO.updatedBy = String(sessionStorage.getItem('UserInfo.username') + "");
        const url = this.ROOT_URL + '/bookingAdmin/vehicles/updateVehicle';
        return this.http.post<any>(`${url}/${vehicleCode}`, vehicleVO);
    }

    deleteVehicle(vehicleCode: string): Observable<string> {
        const url = this.ROOT_URL + '/bookingAdmin/vehicles/deleteVehicle';
        return this.http.get<string>(`${url}/${vehicleCode}`, { responseType: 'text' as 'json' });
    }

    getAllVehicle() {
        return this.http.get<any>(this.ROOT_URL + '/bookingAdmin/vehicles/getAllVehicles');
    }

    // Enhanced method to get vehicles with all required conditions
    getEligibleVehiclesForTrip(tripStartDate?: Date): Observable<VehicleDetailsVO[]> {
        return forkJoin({
            vehicles: this.getAllVehicle(),
            fleetInfo: this.fleetService.getAllFleet()
        }).pipe(
            map(({ vehicles, fleetInfo }) => {
                const currentDate = new Date();
                const tripDate = tripStartDate || currentDate;
                
                return this.filterEligibleVehicles(vehicles, fleetInfo, tripDate);
            }),
            catchError(error => {
                console.error('Error fetching vehicle data:', error);
                return of([]);
            })
        );
    }

    private filterEligibleVehicles(vehicles: VehicleDetailsVO[], fleetInfo: FleetMaintenanceVO[], tripDate: Date): VehicleDetailsVO[] {
        return vehicles.filter(vehicle => {
            // Basic approval and document checks
            if (!vehicle.isApproved || !vehicle.isDocumentsSubmitted) {
                return false;
            }

            // Find corresponding fleet information
            const fleet = fleetInfo.find(f => f.vehicleId === vehicle.vehicleId);
            if (!fleet) {
                return false; // No fleet info available
            }

            // Check fleet approval
            if (!fleet.isApproved) {
                return false;
            }

            // Check vehicle condition - must be 'Good'
            if (fleet.vehicleCondition?.toLowerCase() !== 'good') {
                return false;
            }

            // Check insurance status - must be 'Active'
            if (fleet.insuranceStatus?.toLowerCase() !== 'active') {
                return false;
            }

            // Check insurance expiry date
            if (fleet.insuranceExpiryDate) {
                const insuranceExpiry = new Date(fleet.insuranceExpiryDate);
                if (insuranceExpiry <= tripDate) {
                    return false; // Insurance expired or expires on trip date
                }
            }

            // Check service due date - should not be overdue
            if (fleet.serviceDueOn) {
                const serviceDue = new Date(fleet.serviceDueOn);
                const daysDifference = Math.ceil((serviceDue.getTime() - tripDate.getTime()) / (1000 * 3600 * 24));
                
                // Vehicle should not be scheduled for service within 3 days of trip
                if (daysDifference <= 3 && daysDifference >= 0) {
                    return false;
                }
                
                // Vehicle should not be overdue for service
                if (serviceDue < tripDate) {
                    return false;
                }
            }

            return true;
        }).map(vehicle => {
            // Enhance vehicle object with fleet information
            const fleet = fleetInfo.find(f => f.vehicleId === vehicle.vehicleId);
            return {
                ...vehicle,
                fleetInfo: fleet
            } as VehicleDetailsVO & { fleetInfo?: FleetMaintenanceVO };
        });
    }

    // Method to get vehicles with warnings (for notification purposes)
    getVehiclesWithServiceNotifications(daysAhead: number = 7): Observable<any[]> {
        return forkJoin({
            vehicles: this.getAllVehicle(),
            fleetInfo: this.fleetService.getAllFleet()
        }).pipe(
            map(({ vehicles, fleetInfo }) => {
                const currentDate = new Date();
                const notificationDate = new Date(currentDate.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
                
                return this.getServiceNotifications(vehicles, fleetInfo, currentDate, notificationDate);
            }),
            catchError(error => {
                console.error('Error fetching notification data:', error);
                return of([]);
            })
        );
    }

    private getServiceNotifications(vehicles: VehicleDetailsVO[], fleetInfo: FleetMaintenanceVO[], currentDate: Date, notificationDate: Date): any[] {
        const notifications: any[] = [];

        vehicles.forEach(vehicle => {
            const fleet = fleetInfo.find(f => f.vehicleId === vehicle.vehicleId);
            if (!fleet) return;

            const vehicleData = {
                vehicleCode: vehicle.vehicleCode,
                vehicleType: vehicle.vehicleType,
                partnerName: vehicle.partnerName,
                notifications: [] as any[]
            };

            // Service due notifications
            if (fleet.serviceDueOn) {
                const serviceDue = new Date(fleet.serviceDueOn);
                if (serviceDue >= currentDate && serviceDue <= notificationDate) {
                    const daysUntilService = Math.ceil((serviceDue.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
                    vehicleData.notifications.push({
                        type: 'service',
                        message: `Service due in ${daysUntilService} days`,
                        dueDate: serviceDue,
                        priority: daysUntilService <= 3 ? 'high' : 'medium'
                    });
                }
            }

            // Insurance expiry notifications
            if (fleet.insuranceExpiryDate) {
                const insuranceExpiry = new Date(fleet.insuranceExpiryDate);
                if (insuranceExpiry >= currentDate && insuranceExpiry <= notificationDate) {
                    const daysUntilExpiry = Math.ceil((insuranceExpiry.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
                    vehicleData.notifications.push({
                        type: 'insurance',
                        message: `Insurance expires in ${daysUntilExpiry} days`,
                        dueDate: insuranceExpiry,
                        priority: daysUntilExpiry <= 7 ? 'high' : 'medium'
                    });
                }
            }

            // Only include vehicles with notifications
            if (vehicleData.notifications.length > 0) {
                notifications.push(vehicleData);
            }
        });

        return notifications;
    }




}