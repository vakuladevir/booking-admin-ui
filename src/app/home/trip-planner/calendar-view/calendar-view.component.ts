import { Component, Input, Output, EventEmitter } from '@angular/core';
import { VehicleService } from '../../../services/vehicle.service';
import { DriverInfoService } from '../../../services/driverInfo.service';
import { TripSeaterService } from '../../../services/tripSeater.service';
import { TripPlannerService } from '../../../services/tripPlanner.service';
import { VehicleDetailsVO } from '../../../model/vehicleDetailsVO.model';
import { DriverInfoVO } from '../../../model/driverInfoVO.model';
import { TripSeaterVO } from '../../../model/tripSeaterVO.model';
import { MessageDialogService } from 'src/app/services/message-dialog.service';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss']
})
export class CalendarViewComponent {
  @Input() trips: any[] = [];
  @Output() viewTrip = new EventEmitter<any>();
  @Output() editTrip = new EventEmitter<any>();
  @Output() deleteTrip = new EventEmitter<any>();

  @Output() planTrip = new EventEmitter<void>();
  @Output() tripsRefresh = new EventEmitter<void>();

  viewMode: 'day' | 'week' | 'month' = 'month';
  selectedDate: Date = new Date();
  selectedMonth: string = '';
  selectedWeek: string = '';
  selectedTrip: any = null;
  selectedVehicle: VehicleDetailsVO | null = null;
  selectedDriver: DriverInfoVO | null = null;
  selectedTripSeaters: TripSeaterVO[] = [];

  constructor(
    private vehicleService: VehicleService,
    private driverInfoService: DriverInfoService,
    private tripSeaterService: TripSeaterService,
    private tripPlannerService: TripPlannerService,
    private messageDialog: MessageDialogService
  ) {
    // Initialize month and week pickers to today
    this.selectedMonth = this.getMonthString(this.selectedDate);
    this.selectedWeek = this.getWeekString(this.selectedDate);
  }
  

  setViewMode(mode: 'day' | 'week' | 'month') {
    this.viewMode = mode;
    if (mode === 'day') {
      // Keep selectedDate as is
    } else if (mode === 'week') {
      this.selectedWeek = this.getWeekString(this.selectedDate);
    } else if (mode === 'month') {
      this.selectedMonth = this.getMonthString(this.selectedDate);
    }
  }

  onDateChange(type: 'day' | 'week' | 'month', value: string) {
    if (type === 'day') {
      this.selectedDate = value ? new Date(value) : new Date();
    } else if (type === 'week') {
      this.selectedWeek = value;
      // Set selectedDate to first day of week
      if (value) {
        const [year, week] = value.split('-W');
        const d = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
        // Adjust to Monday
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        this.selectedDate = new Date(d.setDate(diff));
      }
    } else if (type === 'month') {
      this.selectedMonth = value;
      // Set selectedDate to first day of month
      if (value) {
        const [year, month] = value.split('-');
        this.selectedDate = new Date(Number(year), Number(month) - 1, 1);
      }
    }
  }

  getMonthString(date: Date): string {
    return date ? `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}` : '';
  }

  getWeekString(date: Date): string {
    if (!date) return '';
    // Get ISO week string (YYYY-Www)
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    // Calculate week number
    const weekNo = 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${temp.getFullYear()}-W${('0' + weekNo).slice(-2)}`;
  }

  onTripClick(trip: any) {
    this.selectedTrip = trip;
    this.selectedVehicle = null;
    this.selectedDriver = null;
    this.selectedTripSeaters = [];
    if (trip.vehicleCode) {
      this.vehicleService.getVehicleByCode(trip.vehicleCode).subscribe(
        (vehicle: VehicleDetailsVO) => this.selectedVehicle = vehicle,
        () => this.selectedVehicle = null
      );
    }
    if (trip.driverId) {
      this.driverInfoService.getDriverById(trip.driverId).subscribe(
        (driver: DriverInfoVO) => this.selectedDriver = driver,
        () => this.selectedDriver = null
      );
    }
    if (trip.tripPlannerId) {
      this.tripSeaterService.getByTripPlanner(trip.tripPlannerId).subscribe(
        (seaters: TripSeaterVO[]) => this.selectedTripSeaters = seaters,
        () => this.selectedTripSeaters = []
      );
    }
    this.viewTrip.emit(trip);
  }

  onEditTrip(trip: any) {
    this.editTrip.emit(trip);
  }

  onDeleteTrip(trip: any) {
    if (!trip || !trip.tripPlannerId) return;
    this.tripPlannerService.deleteTrip(trip.tripPlannerId).subscribe(
      () => {
        this.messageDialog.openDialog('Success', 'Trip deleted successfully!', 'Ok');
        this.selectedTrip = null;
        this.tripsRefresh.emit();
      },
      (error) => {
        this.messageDialog.openDialog('Error', 'Failed to delete trip.', 'Close');
      }
    );
  }

  onPlanTrip() {
    this.planTrip.emit();
  }

  onUpdateTripStatus(trip: any, status: string) {
    if (!trip || !trip.tripPlannerId) return;
    this.tripPlannerService.updateTripStatus(trip.tripPlannerId, status).subscribe(
      (resp: any) => {
        trip.tripStatus = status;
        this.selectedTrip = { ...trip };
        // Inside onUpdateTripStatus success callback:
        this.messageDialog.openDialog('Success', 'Trip status updated successfully.', 'Close');
        this.selectedTrip = null;
        this.tripsRefresh.emit();
      },
      (err: any) => {
        this.messageDialog.openDialog('Error', 'Failed to update trip status.', 'Close');
      }
    );
  }

  getTripTimeClass(date: Date | string): string {
    // Accepts Date or ISO string
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getHours())) return 'morning';
    const hour = d.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
}
