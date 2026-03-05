import { Component, OnInit } from '@angular/core';
import { ParnterMasterService } from '../../../services/partnerMaster.service';
import { VehicleService } from '../../../services/vehicle.service';
import { TripPlannerService } from '../../../services/tripPlanner.service';
import { DriverInfoService } from '../../../services/driverInfo.service';
import { FleetService } from '../../../services/fleet.service';
import { PartnerMasterVO } from '../../../model/partnerMasterVO.model';
import { VehicleDetailsVO } from '../../../model/vehicleDetailsVO.model';
import { TripPlannerVO } from '../../../model/tripPlannerVO.model';
import { DriverInfoVO } from '../../../model/driverInfoVO.model';
import { FleetMaintenanceVO } from '../../../model/fleetMaintenanceVO.model';

@Component({
  selector: 'app-trip-reports',
  templateUrl: './trip-reports.component.html',
  styleUrls: ['./trip-reports.component.scss']
})
export class TripReportsComponent implements OnInit {
  reportType: string = 'partner';

  partners: PartnerMasterVO[] = [];
  vehicles: VehicleDetailsVO[] = [];
  trips: TripPlannerVO[] = [];
  drivers: DriverInfoVO[] = [];
  fleets: FleetMaintenanceVO[] = [];

  selectedPartner: PartnerMasterVO | null = null;
  partnerVehicles: VehicleDetailsVO[] = [];
  partnerTrips: TripPlannerVO[] = [];
  selectedPartnerVehicle: VehicleDetailsVO | null = null;

  selectedDriver: DriverInfoVO | null = null;
  driverTrips: TripPlannerVO[] = [];

  selectedVehicle: VehicleDetailsVO | null = null;
  vehicleTrips: TripPlannerVO[] = [];

  locations: string[] = [];
  selectedLocation: string | null = null;
  locationTrips: TripPlannerVO[] = [];

  isLoading: boolean = false;
  errorMsg: string = '';

  showTripModal = false;
  selectedTrip: TripPlannerVO | null = null;

  partnerTripStatusFilter: string = '';
  driverTripStatusFilter: string = '';

  // Partner trip table filters
  partnerTripFilters = {
    tripPlannerId: '',
    vehicleCode: '',
    fromLoc: '',
    toLoc: '',
    srcStartDate: '',
    desEndDate: '',
    tripStatus: ''
  };

  // Driver trip table filters
  driverTripFilters = {
    tripPlannerId: '',
    vehicleCode: '',
    fromLoc: '',
    toLoc: '',
    srcStartDate: '',
    desEndDate: '',
    tripStatus: ''
  };

  // Vehicle trip table filters
  vehicleTripFilters = {
    tripPlannerId: '',
    fromLoc: '',
    toLoc: '',
    srcStartDate: '',
    desEndDate: '',
    tripStatus: ''
  };

  // Location trip table filters
  locationTripFilters = {
    tripPlannerId: '',
    vehicleCode: '',
    fromLoc: '',
    toLoc: '',
    srcStartDate: '',
    desEndDate: '',
    tripStatus: ''
  };

  constructor(
    private partnerService: ParnterMasterService,
    private vehicleService: VehicleService,
    private tripService: TripPlannerService,
    private driverService: DriverInfoService,
    private fleetService: FleetService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    this.errorMsg = '';
    Promise.all([
      this.partnerService.getAllPartner().toPromise(),
      this.vehicleService.getAllVehicle().toPromise(),
      this.tripService.getAllTrips().toPromise(),
      this.driverService.getAllDrivers().toPromise(),
      this.fleetService.getAllFleet().toPromise()
    ]).then(([partners, vehicles, trips, drivers, fleets]) => {
      this.partners = partners || [];
      this.vehicles = vehicles || [];
      this.trips = trips || [];
      this.drivers = drivers || [];
      this.fleets = fleets || [];
      // Collect unique locations from all trips
      const fromLocs = this.trips.map(t => t.fromLoc).filter(Boolean);
      const toLocs = this.trips.map(t => t.toLoc).filter(Boolean);
      this.locations = Array.from(new Set([...fromLocs, ...toLocs])).sort();
      this.isLoading = false;
    }).catch(err => {
      this.errorMsg = 'Failed to load report data.';
      this.isLoading = false;
    });
  }

  onSelectPartner(partner: PartnerMasterVO) {
    this.selectedPartner = partner;
    this.partnerVehicles = this.vehicles.filter(v => v.partnerId === partner.partnerId);
    const vehicleIds = this.partnerVehicles.map(v => v.vehicleId);
    this.partnerTrips = this.trips.filter(t => vehicleIds.includes(t.vehicleId));
    this.partnerTripStatusFilter = '';
  }

  get filteredPartnerTrips() {
    let trips = this.partnerTrips;
    if (this.selectedPartnerVehicle?.vehicleId != null) {
      trips = trips.filter(t => t.vehicleId === this.selectedPartnerVehicle!.vehicleId);
    }
    Object.entries(this.partnerTripFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'srcStartDate' || key === 'desEndDate') {
          trips = trips.filter(t => ((t as any)[key] || '').toLowerCase().includes(value.toLowerCase()));
        } else {
          trips = trips.filter(t => ((t as any)[key] || '').toString().toLowerCase().includes(value.toLowerCase()));
        }
      }
    });
    return trips;
  }
  onPartnerVehicleSelect(vehicle: VehicleDetailsVO) {
    this.selectedPartnerVehicle = vehicle;
  }

  clearPartnerVehicleSelection() {
    this.selectedPartnerVehicle = null;
  }

  clearPartnerSelection() {
    this.selectedPartner = null;
    this.partnerVehicles = [];
    this.partnerTrips = [];
  }

  onPartnerSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const partnerId = Number(select.value);
    const partner = this.partners.find(p => p.partnerId === partnerId);
    if (partner) {
      this.onSelectPartner(partner);
    }
  }

  onDriverSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const driverId = Number(select.value);
    const driver = this.drivers.find(d => d.driverId === driverId);
    if (driver) {
      this.onSelectDriver(driver);
    }
  }

  onSelectDriver(driver: DriverInfoVO) {
    this.selectedDriver = driver;
    this.driverTrips = this.trips.filter(t => t.driverId === driver.driverId);
    this.driverTripStatusFilter = '';
  }

  get filteredDriverTrips() {
    let trips = this.driverTrips;
    Object.entries(this.driverTripFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'srcStartDate' || key === 'desEndDate') {
          trips = trips.filter(t => ((t as any)[key] || '').toLowerCase().includes(value.toLowerCase()));
        } else {
          trips = trips.filter(t => ((t as any)[key] || '').toString().toLowerCase().includes(value.toLowerCase()));
        }
      }
    });
    return trips;
  }

  clearDriverSelection() {
    this.selectedDriver = null;
    this.driverTrips = [];
  }

  onVehicleSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const vehicleId = Number(select.value);
    const vehicle = this.vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      this.onSelectVehicle(vehicle);
    }
  }

  onSelectVehicle(vehicle: VehicleDetailsVO) {
    this.selectedVehicle = vehicle;
    this.vehicleTrips = this.trips.filter(t => t.vehicleId === vehicle.vehicleId);
    this.vehicleTripFilters = {
      tripPlannerId: '',
      fromLoc: '',
      toLoc: '',
      srcStartDate: '',
      desEndDate: '',
      tripStatus: ''
    };
  }

  clearVehicleSelection() {
    this.selectedVehicle = null;
    this.vehicleTrips = [];
  }

  getVehicleFleet(vehicleId: number) {
    return this.fleets.find(f => f.vehicleId === vehicleId);
  }

  get filteredVehicleTrips() {
    let trips = this.vehicleTrips;
    Object.entries(this.vehicleTripFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'srcStartDate' || key === 'desEndDate') {
          trips = trips.filter(t => ((t as any)[key] || '').toLowerCase().includes(value.toLowerCase()));
        } else {
          trips = trips.filter(t => ((t as any)[key] || '').toString().toLowerCase().includes(value.toLowerCase()));
        }
      }
    });
    return trips;
  }

  onLocationSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const location = select.value;
    if (location) {
      this.onSelectLocation(location);
    }
  }

  onSelectLocation(location: string) {
    this.selectedLocation = location;
    this.locationTrips = this.trips.filter(t => t.fromLoc === location || t.toLoc === location);
    this.locationTripFilters = {
      tripPlannerId: '',
      vehicleCode: '',
      fromLoc: '',
      toLoc: '',
      srcStartDate: '',
      desEndDate: '',
      tripStatus: ''
    };
  }

  clearLocationSelection() {
    this.selectedLocation = null;
    this.locationTrips = [];
  }

  get filteredLocationTrips() {
    let trips = this.locationTrips;
    Object.entries(this.locationTripFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'srcStartDate' || key === 'desEndDate') {
          trips = trips.filter(t => ((t as any)[key] || '').toLowerCase().includes(value.toLowerCase()));
        } else {
          trips = trips.filter(t => ((t as any)[key] || '').toString().toLowerCase().includes(value.toLowerCase()));
        }
      }
    });
    return trips;
  }

  onViewTrip(trip: TripPlannerVO) {
    this.selectedTrip = trip;
    this.showTripModal = true;
  }

  closeTripModal() {
    this.showTripModal = false;
    this.selectedTrip = null;
  }
}
