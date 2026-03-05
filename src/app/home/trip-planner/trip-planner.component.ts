// ...existing imports...
import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripPlannerVO } from 'src/app/model/tripPlannerVO.model';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { RouteMapVO } from 'src/app/model/routeMapVO.model';
import { VehicleDetailsVO } from 'src/app/model/vehicleDetailsVO.model';
import { DriverInfoVO } from 'src/app/model/driverInfoVO.model';
import { FleetMaintenanceVO } from 'src/app/model/fleetMaintenanceVO.model';
import { GalleyKitchenVO } from 'src/app/model/galleyKitchenVO.model';
import { BudgetPlannerVO } from 'src/app/model/budgetPlannerVO.model';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { RouteMapService } from 'src/app/services/routeMap.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { DriverInfoService } from 'src/app/services/driverInfo.service';
import { TripPlannerService } from 'src/app/services/tripPlanner.service';
import { GalleyKitchenService } from 'src/app/services/galleyKitchen.service';
import { BudgetPlannerService } from 'src/app/services/budgetPlanner.service';
import { FleetService } from 'src/app/services/fleet.service';
import { SeatInfo, VehicleSeatLayout } from 'src/app/model/seat-layout.model';
import { BusRouteConfiguratorComponent } from './bus-route-configurator/bus-route-configurator.component';

@Component({
  selector: 'app-trip-planner',
  templateUrl: './trip-planner.component.html',
  styleUrls: ['./trip-planner.component.scss']
})
export class TripPlannerComponent implements OnInit {
  showTripReports = false;
  showBusRouteConfigModal = false;
  busRouteConfig: any = null;
    openBusRouteConfig() {
      this.showBusRouteConfigModal = true;
    }

    onBusRouteConfigApplied(config: any) {
      this.busRouteConfig = config;
      this.showBusRouteConfigModal = false;
      // Optionally, apply config to trip creation logic here
    }
  /**
   * Controls visibility of the Oneway LTP Date Calculation Hint.
   * Set to true to show the hint, false to hide.
   */
  showLtpHint: boolean = true;
  // Calendar view flag
  isCalendarView: boolean = false;
  // Helper to format date and time to ISO yyyy-MM-dd'T'HH:mm:ss for Java LocalDateTime
  private formatDateTime(date: any, time: any): string {
    if (!date || !time) return '';
    const d = new Date(`${date}T${time}:00`);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  enableSeatSelection = false;
  // ...existing code...
  // ...existing property declarations...

  // Fleet maintenance list for vehicle-fleet mapping
  fleetMaintenanceList: FleetMaintenanceVO[] = [];


  isResettingForm = false;

  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false;
  isView: boolean = false;
  isEdit: boolean = false;
  tripForm!: FormGroup;

  tripObj: TripPlannerVO = new TripPlannerVO();

  // Trip Type Options
  tripType: string = 'oneway'; // 'oneway' or 'roundtrip'

  // Route Maps
  routeMaps: RouteMapVO[] = [];
  routeCodes: string[] = [];
  filteredFromRoutes: RouteMapVO[] = [];
  filteredToRoutes: RouteMapVO[] = [];
  filteredRtFromRoutes: RouteMapVO[] = [];
  filteredRtToRoutes: RouteMapVO[] = [];

  // Vehicles
  vehicles: VehicleDetailsVO[] = [];
  filteredVehicles: VehicleDetailsVO[] = [];
  vehicleNotifications: any[] = [];
  isLoadingVehicles: boolean = false;

  // Drivers
  drivers: DriverInfoVO[] = [];
  filteredDrivers: DriverInfoVO[] = [];
  isLoadingDrivers: boolean = false;
  loadDriversByVehicleBP: boolean = false; // Checkbox state for driver loading preference

  // Return Journey Driver (for round trips)
  filteredReturnDrivers: DriverInfoVO[] = [];
  isLoadingReturnDrivers: boolean = false;
  loadReturnDriversByVehicleBP: boolean = false; // Checkbox state for return driver loading preference

  // Items for multiselect
  availableItems: GalleyKitchenVO[] = [];
  selectedItems: GalleyKitchenVO[] = [];
  isLoadingItems: boolean = false;

  // Dropdown states
  isFromRouteDropdownOpen: boolean = false;
  isToRouteDropdownOpen: boolean = false;
  isRtFromRouteDropdownOpen: boolean = false;
  isRtToRouteDropdownOpen: boolean = false;
  isVehicleDropdownOpen: boolean = false;
  isDriverDropdownOpen: boolean = false;
  isReturnDriverDropdownOpen: boolean = false;
  isItemsDropdownOpen: boolean = false;

  // Search inputs
  fromRouteInput: string = '';
  toRouteInput: string = '';
  rtFromRouteInput: string = '';
  rtToRouteInput: string = '';
  vehicleInput: string = '';
  driverInput: string = '';
  returnDriverInput: string = '';

  // Trip calculations
  tripCost: number = 0;
  costPerSeat: number = 0;
  budgetLastUpdated: Date | null = null;

  // Budget planning
  budgetGenId: string = '';
  availableBudgetVersions: BudgetPlannerVO[] = [];
  selectedBudgetVersion: BudgetPlannerVO | null = null;
  isBudgetDropdownOpen: boolean = false;
  isLoadingBudgetVersions: boolean = false;

  trips: any[] = [];
  filteredTrips: any[] = [];
  searchText: string = '';

  // LTP specific properties
  ltpTrips: TripPlannerVO[] = [];
  isLtpPreview: boolean = false;
  isProcessing: boolean = false;
  isEditingLtpTrip: boolean = false; // Track if we're editing an LTP trip
  isViewingLtpTrip: boolean = false; // Track if we're viewing an LTP trip in read-only mode
  currentEditingLtpTrip: TripPlannerVO | null = null; // Track the specific trip being edited

  // Return route message
  showReturnRouteMessage: { type: 'success' | 'warning', message: string } | null = null;

  // Seat layout state
  seatLayout: VehicleSeatLayout | null = null;
  seatMapTotal: number = 0;
  seatLayoutError: string = '';

  // View mode flag
  isViewMode = false;

  // Calendar view handlers
  onLoadCalendarView() {
    this.isCalendarView = true;
    this.showTripReports = false
    this.isShow = false;
    this.isLtpPreview = false;
    this.isListView = false;
    // Fetch trips from API for calendar view
    this.tripPlannerService.getAllTrips().subscribe(
      (data) => {
        this.trips = Array.isArray(data) ? data : [];
      },
      (error) => {
        this.trips = [];
        console.error('Error loading trips for calendar view:', error);
      }
    );
  }

  onViewCalendarTrip(trip: any) {
    // Show trip details modal or view logic
    // You can reuse your view logic here
    this.onView(trip.tripPlannerId);
  }

  onEditCalendarTrip(trip: any) {
    // Show edit modal or logic (edit only allowed fields)
    // You can reuse your edit logic here
    // Example: this.onEdit(trip.tripId);
  }

  onDeleteCalendarTrip(trip: any) {
    // Delete trip logic
    this.onDelete();
  }

  constructor(
    private formBuilder: FormBuilder,
    private messageDialog: MessageDialogService,
    private routeMapService: RouteMapService,
    private vehicleService: VehicleService,
    private driverService: DriverInfoService,
    private tripPlannerService: TripPlannerService,
    private galleyKitchenService: GalleyKitchenService,
    private budgetPlannerService: BudgetPlannerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fleetService: FleetService
  ) { }

  /**
   * Restores the LTP preview state and resets editing/viewing flags.
   */
  backToLtpPreview() {
    // Only restore LTP preview table view, do not reset form or clear ltpTrips
    this.isLtpPreview = true;
    this.isShow = false;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = false;
    this.isEdit = false;
    this.isEditingLtpTrip = false;
    this.isViewingLtpTrip = false;
    this.currentEditingLtpTrip = null;
    // Debug log for UI state
    console.log('[BackToLtpPreview] Flags:', {
      isLtpPreview: this.isLtpPreview,
      isShow: this.isShow,
      isCreate: this.isCreate,
      isUpdate: this.isUpdate,
      isDelete: this.isDelete,
      isListView: this.isListView,
      isView: this.isView,
      isEdit: this.isEdit,
      isEditingLtpTrip: this.isEditingLtpTrip,
      isViewingLtpTrip: this.isViewingLtpTrip,
      currentEditingLtpTrip: this.currentEditingLtpTrip
    });
    // Optionally, trigger change detection if needed
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.initializeForm(); // Ensure form is initialized first
    this.loadRouteMaps();
    this.loadRouteCodes();
    this.loadVehicles();
    this.loadDrivers();
    this.loadItems();
    this.filteredReturnDrivers = [];

    // Initial budget load if all required fields are present
    this.generateBudgetGenId();

    // Load fleet maintenance data for vehicle-fleet mapping
    this.fleetService.getAllFleet().subscribe((data: FleetMaintenanceVO[]) => {
      this.fleetMaintenanceList = Array.isArray(data) ? data : [];
      console.log('[FleetMaintenance] Loaded fleetMaintenanceList:', this.fleetMaintenanceList);
    }, error => {
      console.error('[FleetMaintenance] Error loading fleet maintenance data:', error);
      this.fleetMaintenanceList = [];
    });
  }

  initializeForm() {
    this.tripForm = this.formBuilder.group({
      tripType: [this.tripType, Validators.required],
      isLtp: [false],

      // One Way Trip Fields
      routeCode1: ['', Validators.required],
      fromLoc: ['', Validators.required],
      toLoc: ['', Validators.required],
      srcStartDate: ['', Validators.required],
      srcStartTime: ['', Validators.required],
      desEndDate: ['', Validators.required],
      desEndTime: ['', Validators.required],

      // Round Trip Fields
      routeCode2: [''],
      rtFromLoc: [''],
      rtToLoc: [''],
      rtSrcStartDate: [''],
      rtSrcStartTime: [''],
      rtDesEndDate: [''],
      rtDesEndTime: [''],

      // LTP Fields
      ltpStartDate: [''],
      ltpEndDate: [''],

      // Common Fields
      vehicleId: ['', Validators.required],
      vehicleCode: [''],
      driverId: ['', Validators.required],
      driverPhoneNo: [''],

      // Return Journey Driver Fields (for round trips)
      returnDriverId: [''],
      returnDriverPhoneNo: [''],

      selectedItems: [[]],
  budgetId: [''],
  noOfSeats: [''],
  fleetId: [''],

    });

    // Watch for trip type changes
    this.tripForm.get('tripType')?.valueChanges.subscribe(value => {
      this.tripType = value;
      this.updateValidators();
      if (!this.isResettingForm) {
        this.generateBudgetGenId();
      }
    });
  // ...existing code...
    this.tripForm.get('routeCode1')?.valueChanges.subscribe(() => {
      if (!this.isResettingForm) {
        this.generateBudgetGenId();
      }
    });
    this.tripForm.get('routeCode2')?.valueChanges.subscribe(() => {
      if (!this.isResettingForm) {
        this.generateBudgetGenId();
      }
    });
    this.tripForm.get('vehicleId')?.valueChanges.subscribe(() => {
      if (!this.isResettingForm) {
        this.generateBudgetGenId();
      }
    });

    // Watch for LTP changes
    this.tripForm.get('isLtp')?.valueChanges.subscribe(value => {
      this.updateValidators();
    });

    // Watch for frequency type changes (oneway LTP)
  // ...existing code...
  }

  loadRouteMaps() {
    this.routeMapService.getAllRoutes().subscribe((data: RouteMapVO[]) => {
      this.routeMaps = data;
      this.filteredFromRoutes = data;
      this.filteredToRoutes = data;
      this.filteredRtFromRoutes = data;
      this.filteredRtToRoutes = data;
    });
  }

  // Map seat type code to full form
  getSeatTypeFullForm(type: string): string {
    switch (type) {
      // Legacy codes
      case 'SW': return 'Seater Window';
      case 'SM': return 'Seater Middle';
      case 'LW': return 'Lower Window';
      case 'LM': return 'Lower Middle';
      case 'UW': return 'Upper Window';
      case 'UM': return 'Upper Middle';
      case 'LS': return 'Lower Single';
      case 'US': return 'Upper Single';
      
      // Seater Vehicle Types
      case 'RWD': return 'Right Window Driver';
      case 'MS': return 'Middle Seater';
      case 'LWS': return 'Left Window Seater';
      case 'RWS': return 'Right Window Seater';
      
      // Sleeper Vehicle Types - Lower
      case 'RWLO': return 'Right Window Lower';
      case 'RMLO': return 'Right Middle Lower';
      case 'LWLO': return 'Left Window Lower';
      case 'LMLO': return 'Left Middle Lower';
      
      // Sleeper Vehicle Types - Upper
      case 'RWU': return 'Right Window Upper';
      case 'RMU': return 'Right Middle Upper';
      case 'LWU': return 'Left Window Upper';
      case 'LMU': return 'Left Middle Upper';
      
      // Semi Sleeper (future expansion)
      case 'RWSS': return 'Right Window Semi Sleeper';
      case 'RMSS': return 'Right Middle Semi Sleeper';
      case 'LWSS': return 'Left Window Semi Sleeper';
      case 'LMSS': return 'Left Middle Semi Sleeper';
      
      // Empty seat (should be filtered out)
      case 'E': return 'Empty';
      
      default: return type;
    }
  }

  /**
   * Check if a seat should be included in pricing calculations
   * Excludes Driver seats (RWD) and Empty seats (E)
   */
  isSeatPriceable(seatType: string): boolean {
    const excludedTypes = ['RWD', 'E', 'DRIVER', 'EMPTY'];
    return !excludedTypes.includes(seatType?.toUpperCase());
  }

  loadRouteCodes() {
    this.routeMapService.getAllRouteCode().subscribe((data: any) => {
      if (data && Array.isArray(data)) {
        this.routeCodes = data;
      } else {
        // If the response format is different, extract route codes from routeMaps
        this.routeCodes = this.routeMaps.map(route => route.routeMapCode).filter(code => code) as string[];
      }
    }, (error) => {
      console.error('Error loading route codes:', error);
      // Fallback: extract route codes from routeMaps
      this.routeCodes = this.routeMaps.map(route => route.routeMapCode).filter(code => code) as string[];
    });
  }

  loadVehicles() {
    this.isLoadingVehicles = true;

    // Get trip start date for filtering
    const tripStartDate = this.tripForm?.get('srcStartDate')?.value ?
      new Date(this.tripForm.get('srcStartDate')?.value) : new Date();

    this.vehicleService.getEligibleVehiclesForTrip(tripStartDate).subscribe(
      (data: VehicleDetailsVO[]) => {
        this.vehicles = data;
        this.filteredVehicles = data;
        this.isLoadingVehicles = false;

        console.log(`Loaded ${data.length} eligible vehicles for trip planning`);

        // Load vehicle notifications
        this.loadVehicleNotifications();
      },
      (error) => {
        console.error('Error loading vehicles:', error);
        this.isLoadingVehicles = false;
        this.messageDialog.openDialog('Warning', 'Some vehicles may not be available due to filtering conditions', 'Ok');

        // Fallback: load all vehicles without filtering
        this.loadAllVehicles();
      }
    );
  }

  loadAllVehicles() {
    this.vehicleService.getAllVehicle().subscribe(
      (data: VehicleDetailsVO[]) => {
        // Apply basic filtering
        this.vehicles = data.filter(vehicle =>
          vehicle.isApproved && vehicle.isDocumentsSubmitted
        );
        this.filteredVehicles = this.vehicles;
        console.log(`Loaded ${this.vehicles.length} vehicles with basic filtering`);
      },
      (error) => {
        console.error('Error loading vehicles:', error);
        this.vehicles = [];
        this.filteredVehicles = [];
      }
    );
  }

  loadVehicleNotifications() {
    this.vehicleService.getVehiclesWithServiceNotifications(7).subscribe(
      (notifications) => {
        this.vehicleNotifications = notifications;

        if (notifications.length > 0) {
          const highPriorityCount = notifications.filter(n =>
            n.notifications.some((notif: any) => notif.priority === 'high')
          ).length;

          if (highPriorityCount > 0) {
            this.messageDialog.openDialog(
              'Vehicle Alerts',
              `${highPriorityCount} vehicles have urgent service/insurance notifications. Check vehicle status before planning trips.`,
              'Ok'
            );
          }
        }
      },
      (error) => {
        console.error('Error loading vehicle notifications:', error);
      }
    );
  }

  // Vehicle status helper methods
  hasVehicleNotifications(vehicleId: string | number | undefined): boolean {
    if (!vehicleId) return false;
    return this.vehicleNotifications.some(notification =>
      notification.vehicleId === vehicleId || notification.vehicleId === vehicleId.toString()
    );
  }

  getVehicleCondition(vehicle: VehicleDetailsVO): string {
    // This would typically come from fleet maintenance data
    // For now, assume all filtered vehicles are in good condition
    return 'Good';
  }

  getInsuranceStatus(vehicle: VehicleDetailsVO): string {
    // This would typically come from fleet maintenance data
    // For now, assume all filtered vehicles have active insurance
    return 'Active';
  }

  getVehicleNotifications(vehicleId: string | number | undefined): any[] {
    if (!vehicleId) return [];
    const vehicleNotification = this.vehicleNotifications.find(n =>
      n.vehicleId === vehicleId || n.vehicleId === vehicleId.toString()
    );
    return vehicleNotification ? vehicleNotification.notifications : [];
  }

  loadDrivers() {
    this.isLoadingDrivers = true;

    this.driverService.getAllDrivers().subscribe(
      (data: DriverInfoVO[]) => {
        // Apply common filtering conditions
        const eligibleDrivers = data.filter(driver =>
          driver.isDocumentsSubmitted &&
          driver.drivingLicense &&
          driver.drivingLicense.trim() !== ''
        );

        if (this.loadDriversByVehicleBP) {
          this.loadDriversByVehicleBPCode(eligibleDrivers);
        } else {
          this.drivers = eligibleDrivers;
          this.filteredDrivers = eligibleDrivers;
          this.filteredReturnDrivers = eligibleDrivers; // Initialize return drivers list
          this.isLoadingDrivers = false;
          console.log(`Loaded ${eligibleDrivers.length} eligible drivers (all available)`);
        }
      },
      (error) => {
        console.error('Error loading drivers:', error);
        this.isLoadingDrivers = false;
        this.drivers = [];
        this.filteredDrivers = [];
        this.filteredReturnDrivers = [];
      }
    );
  }

  loadDriversByVehicleBPCode(eligibleDrivers: DriverInfoVO[]) {
    const selectedVehicleId = this.tripForm?.get('vehicleId')?.value;

    if (!selectedVehicleId) {
      // No vehicle selected, show all eligible drivers
      this.drivers = eligibleDrivers;
      this.filteredDrivers = eligibleDrivers;
      this.filteredReturnDrivers = eligibleDrivers; // Initialize return drivers list
      this.isLoadingDrivers = false;
      console.log(`Loaded ${eligibleDrivers.length} eligible drivers (no vehicle filter)`);
      return;
    }

    // Find the selected vehicle to get its BPCode
    const selectedVehicle = this.vehicles.find(v => v.vehicleId === selectedVehicleId);

    if (!selectedVehicle || !selectedVehicle.bpCode) {
      // Vehicle not found or no BPCode, show all eligible drivers
      this.drivers = eligibleDrivers;
      this.filteredDrivers = eligibleDrivers;
      this.filteredReturnDrivers = eligibleDrivers; // Initialize return drivers list
      this.isLoadingDrivers = false;
      console.log(`Loaded ${eligibleDrivers.length} eligible drivers (vehicle has no BP code)`);
      return;
    }

    // Filter drivers by matching BPCode
    const matchingDrivers = eligibleDrivers.filter(driver =>
      driver.bpCode === selectedVehicle.bpCode
    );

    this.drivers = matchingDrivers;
    this.filteredDrivers = matchingDrivers;
    this.filteredReturnDrivers = matchingDrivers; // Initialize return drivers list
    this.isLoadingDrivers = false;

    console.log(`Loaded ${matchingDrivers.length} drivers matching vehicle BP code: ${selectedVehicle.bpCode}`);

    if (matchingDrivers.length === 0) {
      this.messageDialog.openDialog(
        'Info',
        `No drivers found matching vehicle's partner code (${selectedVehicle.bpCode}). Consider unchecking "Load by Vehicle Partner" to see all available drivers.`,
        'Ok'
      );
    }
  }

  onDriverLoadingPreferenceChange() {
    // Reload drivers when user changes the preference
    this.loadDrivers();

    // Clear current driver selection if preference changed
    this.driverInput = '';
    this.tripForm?.get('driverId')?.setValue('');
    this.tripForm?.get('driverPhoneNo')?.setValue('');

    // Clear return driver selection if preference changed
    this.returnDriverInput = '';
    this.tripForm?.get('returnDriverId')?.setValue('');
    this.tripForm?.get('returnDriverPhoneNo')?.setValue('');
  }

  // Helper methods for driver UI
  isDriverPartnerMatch(driver: DriverInfoVO): boolean {
    if (!this.loadDriversByVehicleBP) return false;

    const selectedVehicleId = this.tripForm?.get('vehicleId')?.value;
    if (!selectedVehicleId) return false;

    const selectedVehicle = this.vehicles.find(v => v.vehicleId === selectedVehicleId);
    return selectedVehicle ? driver.bpCode === selectedVehicle.bpCode : false;
  }

  getSelectedVehicleBPCode(): string | null {
    const selectedVehicleId = this.tripForm?.get('vehicleId')?.value;
    if (!selectedVehicleId) return null;

    const selectedVehicle = this.vehicles.find(v => v.vehicleId === selectedVehicleId);
    return selectedVehicle?.bpCode || null;
  }

  loadItems() {
    this.isLoadingItems = true;
    this.galleyKitchenService.getAllItemsActive().subscribe(
      (data: GalleyKitchenVO[]) => {
        this.availableItems = data;
        this.isLoadingItems = false;
        console.log(`Loaded ${data.length} active galley kitchen items`);
      },
      (error) => {
        console.error('Error loading galley kitchen items:', error);
        this.isLoadingItems = false;
        this.availableItems = [];
      }
    );
  }

  updateValidators() {
    const routeCode2 = this.tripForm.get('routeCode2');
    const rtFromLoc = this.tripForm.get('rtFromLoc');
    const rtToLoc = this.tripForm.get('rtToLoc');
    const rtSrcStartDate = this.tripForm.get('rtSrcStartDate');
    const rtSrcStartTime = this.tripForm.get('rtSrcStartTime');
    const rtDesEndDate = this.tripForm.get('rtDesEndDate');
    const rtDesEndTime = this.tripForm.get('rtDesEndTime');
    const returnDriverId = this.tripForm.get('returnDriverId');
    const ltpStartDate = this.tripForm.get('ltpStartDate');
    const ltpEndDate = this.tripForm.get('ltpEndDate');

    // Clear validators first
    [routeCode2, rtFromLoc, rtToLoc, rtSrcStartDate, rtSrcStartTime, rtDesEndDate, rtDesEndTime, returnDriverId, ltpStartDate, ltpEndDate].forEach(control => {
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    // Oneway LTP: mainTripFrequency, mainTripFrequencyType, returnTripOffset required
    const mainTripFrequency = this.tripForm.get('mainTripFrequency');
    const mainTripFrequencyType = this.tripForm.get('mainTripFrequencyType');
    const returnTripOffset = this.tripForm.get('returnTripOffset');
    // Always clear first
    [mainTripFrequency, mainTripFrequencyType, returnTripOffset].forEach(ctrl => {
      ctrl?.clearValidators();
      ctrl?.updateValueAndValidity();
    });

    if (this.tripType === 'roundtrip') {
      [routeCode2, rtFromLoc, rtToLoc, rtSrcStartDate, rtSrcStartTime, rtDesEndDate, rtDesEndTime, returnDriverId].forEach(control => {
        control?.setValidators([Validators.required]);
        control?.updateValueAndValidity();
      });
    }

    if (this.tripForm.get('isLtp')?.value) {
      [ltpStartDate, ltpEndDate].forEach(control => {
        control?.setValidators([Validators.required]);
        control?.updateValueAndValidity();
      });
      // Oneway LTP: enforce required for frequency fields
      if (this.tripType === 'oneway' && this.tripForm.get('isLtp')?.value) {
        mainTripFrequencyType?.setValidators([Validators.required]);
        mainTripFrequency?.setValidators([Validators.required]);
        mainTripFrequencyType?.updateValueAndValidity();
        mainTripFrequency?.updateValueAndValidity();
      }
    }
  }

  // Route selection methods
  onFromRouteInput() {
    const search = this.fromRouteInput.toLowerCase().trim();
    if (search.length === 0) {
      this.filteredFromRoutes = this.routeMaps;
    } else {
      this.filteredFromRoutes = this.routeMaps.filter(route =>
        route.routeMapCode?.toLowerCase().includes(search) ||
        route.fromLocation.toLowerCase().includes(search) ||
        route.toLocation.toLowerCase().includes(search)
      );
    }
    this.isFromRouteDropdownOpen = this.filteredFromRoutes.length > 0;
  }

  selectFromRoute(route: RouteMapVO) {
    this.fromRouteInput = `${route.routeMapCode} - ${route.fromLocation} to ${route.toLocation}`;
    this.tripForm.get('routeCode1')?.setValue(route.routeMapCode);
    this.tripForm.get('fromLoc')?.setValue(route.fromLocation);
    this.tripForm.get('toLoc')?.setValue(route.toLocation);
    // Set budgetId if available in route object
    if (route.routeMapId) {
      this.tripForm.get('budgetId')?.setValue(route.routeMapId);
    }
    this.isFromRouteDropdownOpen = false;

    // Auto-select return route for round trips
    if (this.tripType === 'roundtrip') {
      this.autoSelectReturnRoute(route);
    }

    this.calculateTripCost();
  }

  onToRouteInput() {
    const search = this.toRouteInput.toLowerCase().trim();
    if (search.length === 0) {
      this.filteredToRoutes = this.routeMaps;
    } else {
      this.filteredToRoutes = this.routeMaps.filter(route =>
        route.routeMapCode?.toLowerCase().includes(search) ||
        route.fromLocation.toLowerCase().includes(search) ||
        route.toLocation.toLowerCase().includes(search)
      );
    }
    this.isToRouteDropdownOpen = this.filteredToRoutes.length > 0;
  }

  selectToRoute(route: RouteMapVO) {
    this.toRouteInput = `${route.routeMapCode} - ${route.fromLocation} to ${route.toLocation}`;
    this.tripForm.get('routeCode1')?.setValue(route.routeMapCode);
    this.tripForm.get('fromLoc')?.setValue(route.fromLocation);
    this.tripForm.get('toLoc')?.setValue(route.toLocation);
    // Set budgetId if available in route object
    if (route.routeMapId) {
      this.tripForm.get('budgetId')?.setValue(route.routeMapId);
    }
    this.isToRouteDropdownOpen = false;
    this.calculateTripCost();
  }

  // Round trip route selection methods
  onRtFromRouteInput() {
    const search = this.rtFromRouteInput.toLowerCase().trim();
    if (search.length === 0) {
      this.filteredRtFromRoutes = this.routeMaps;
    } else {
      this.filteredRtFromRoutes = this.routeMaps.filter(route =>
        route.routeMapCode?.toLowerCase().includes(search) ||
        route.fromLocation.toLowerCase().includes(search) ||
        route.toLocation.toLowerCase().includes(search)
      );
    }
    this.isRtFromRouteDropdownOpen = this.filteredRtFromRoutes.length > 0;
  }

  selectRtFromRoute(route: RouteMapVO) {
    this.rtFromRouteInput = `${route.routeMapCode} - ${route.fromLocation} to ${route.toLocation}`;
    this.tripForm.get('routeCode2')?.setValue(route.routeMapCode);
    this.tripForm.get('rtFromLoc')?.setValue(route.fromLocation);
    this.tripForm.get('rtToLoc')?.setValue(route.toLocation);
    this.isRtFromRouteDropdownOpen = false;
    this.calculateTripCost();
  }

  autoSelectReturnRoute(selectedRoute: RouteMapVO) {
    // Look for reverse route: from selectedRoute.toLocation to selectedRoute.fromLocation
    const reverseRoute = this.routeMaps.find(route =>
      route.fromLocation?.toLowerCase() === selectedRoute.toLocation?.toLowerCase() &&
      route.toLocation?.toLowerCase() === selectedRoute.fromLocation?.toLowerCase()
    );

    if (reverseRoute) {
      // Auto-select the reverse route
      this.rtFromRouteInput = `${reverseRoute.routeMapCode} - ${reverseRoute.fromLocation} to ${reverseRoute.toLocation}`;
      this.tripForm.get('routeCode2')?.setValue(reverseRoute.routeMapCode);
      this.tripForm.get('rtFromLoc')?.setValue(reverseRoute.fromLocation);
      this.tripForm.get('rtToLoc')?.setValue(reverseRoute.toLocation);

      // Show success message
      this.showReturnRouteMessage = {
        type: 'success',
        message: `Return route auto-selected: ${reverseRoute.routeMapCode}`
      };

      console.log('Auto-selected return route:', reverseRoute.routeMapCode);
    } else {
      // No reverse route found - show message dialog and reset form
      const alertMessage = `No return route found from ${selectedRoute.toLocation} to ${selectedRoute.fromLocation}. Please select different route.`;
      this.messageDialog.openDialog('Warning', alertMessage, 'Ok');

      // Reset the entire form to prevent user from proceeding
      this.resetForm();

      console.log('No reverse route found for:', selectedRoute.routeMapCode, '- Form has been reset');

      // Don't show the temporary message since we're using message dialog
      this.showReturnRouteMessage = null;
      return; // Exit early since form is reset
    }

    // Clear success message after 5 seconds (only for success messages)
    if (this.showReturnRouteMessage?.type === 'success') {
      setTimeout(() => {
        this.showReturnRouteMessage = null;
      }, 5000);
    }
  }

  // Vehicle selection methods
  onVehicleInput() {
    const search = this.vehicleInput.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(vehicle =>
      vehicle.vehicleCode?.toLowerCase().includes(search) ||
      vehicle.vehicleType?.toLowerCase().includes(search)
    );
    this.isVehicleDropdownOpen = this.filteredVehicles.length > 0;
  }

  // Helper to generate seats array if backend does not provide it
  generateSeats(noOfSeats: number): SeatInfo[] {
    // Simple logic: first and last seats are window, rest are middle (customize as needed)
    return Array.from({ length: noOfSeats }, (_, i) => ({
      seatNumber: (i + 1).toString(),
      seatType: (i === 0 || i === noOfSeats - 1) ? 'window' : 'middle',
      price: 0,
      editable: true
    }));
  }

  // Ensure seat array is generated and displayed all at once on initial load
  selectVehicle(vehicle: VehicleDetailsVO) {
    // Set fleetId in the form based on selected vehicle
    let fleetId: number = 0;
    if (vehicle.vehicleId && this.fleetMaintenanceList?.length) {
      const fleetInfo = this.fleetMaintenanceList.find(f => f.vehicleId === vehicle.vehicleId);
      if (fleetInfo && fleetInfo.fleetId) {
        fleetId = fleetInfo.fleetId;
      }
    }
    this.tripForm.get('fleetId')?.setValue(fleetId);
    this.vehicleInput = `${vehicle.vehicleCode} - ${vehicle.vehicleType}`;
    this.tripForm.get('vehicleId')?.setValue(vehicle.vehicleId);
    this.tripForm.get('vehicleCode')?.setValue(vehicle.vehicleCode);
    // Don't set noOfSeats here - wait for backend data to parse actual priceable seats
    // this.tripForm.get('noOfSeats')?.setValue(vehicle.seatingCapacity);
    this.isVehicleDropdownOpen = false;
    this.calculateTripCost();
    // Reset seat layout and error before loading
    this.seatLayout = null;
    this.seatLayoutError = '';
    this.cdr.detectChanges();
    console.log('[selectVehicle] Loading seat layout for', vehicle.vehicleType);
    this.vehicleService.getByVTypeName(vehicle.vehicleType || '').subscribe(data => {
      console.log('[selectVehicle] Backend data received:', {
        vehicleType: vehicle.vehicleType,
        noOfSeats: data?.noOfSeats,
        seatingCapacity: vehicle.seatingCapacity,
        seatingInfo: data?.seatingInfo
      });
      
      if (data && data.seatingImageUrl && data.noOfSeats) {
        let seats: any[] = [];
        // Parse dynamic seat types from backend if available
        if (data.seatingInfo) {
          // Example formats:
          // Simple: '1-SW,2-SW,3-SW,4-SW,5-SW,6-SM,7-SM,8-SM,9-SM,10-SM,11-SW,12-SW,13-SW,14-SW,15-SW,16-SW'
          // New format: '0-RWD,1-MS,2-LWS,3-RWS,4-MS,5-RWS,6-MS,7-LWS,...'
          // Complex format: 'I-1;ROW1-RWD-0, MS-1, LWS-2;ROW2-RWS-3, MS-4, E;ROW3-RWS-5, MS-6, E, LWS-7;...'
          
          let seatingData = data.seatingInfo;
          
          // Remove image markers (I-1, I-2, etc.) and row markers (ROW1, ROW2, etc.)
          seatingData = seatingData.replace(/I-\d+;?/g, ''); // Remove I-1, I-2, etc.
          seatingData = seatingData.replace(/ROW\d+-?/g, ''); // Remove ROW1-, ROW2-, etc.
          seatingData = seatingData.replace(/;/g, ','); // Replace semicolons with commas
          seatingData = seatingData.replace(/\s+/g, ''); // Remove all whitespace
          
          console.log('[selectVehicle] Cleaned seating data:', seatingData);
          
          // Parse the cleaned data
          seats = seatingData.split(',')
            .filter((entry: string) => entry.trim().length > 0) // Remove empty entries
            .map((entry: string) => {
              const parts = entry.trim().split('-');
              if (parts.length === 2) {
                // Format: type-number (e.g., MS-1, LWS-2)
                return {
                  seatNumber: parts[1],
                  seatType: parts[0],
                  price: 0,
                  editable: true
                };
              } else if (parts.length === 1) {
                // Format: just type (e.g., E for empty)
                return {
                  seatNumber: '',
                  seatType: parts[0],
                  price: 0,
                  editable: true
                };
              } else {
                // Unknown format, return null
                return null;
              }
            })
            .filter((seat: any) => seat !== null && seat.seatNumber !== ''); // Remove invalid entries
          
          console.log('[selectVehicle] Total seats parsed:', seats.length, 'seats:', seats);
          
          // Filter out driver and empty seats
          seats = seats.filter((seat: SeatInfo) => this.isSeatPriceable(seat.seatType));
          
          console.log('[selectVehicle] After filtering non-priceable seats:', seats.length, 'priceable seats');
        } else {
          // Fallback to old logic if no seatingInfo
          // Subtract 1 for driver seat if using total capacity
          const passengerSeats = data.noOfSeats > 0 ? data.noOfSeats - 1 : data.noOfSeats;
          seats = this.generateSeats(passengerSeats);
        }
        
        this.seatLayout = {
          imageUrl: data.seatingImageUrl,
          seats: seats
        };
        
        // Update the form field with the count of priceable seats
        const priceableSeatsCount = seats.length;
        this.tripForm.get('noOfSeats')?.setValue(priceableSeatsCount);
        
        this.updateSeatPricing();
        this.seatLayoutError = '';
        this.cdr.detectChanges();
        console.log('[selectVehicle] Seat layout loaded with', priceableSeatsCount, 'priceable seats:', this.seatLayout);
      } else {
        this.seatLayout = null;
        this.seatLayoutError = 'No seat layout found for this vehicle type.';
        // Set noOfSeats to seatingCapacity minus 1 (for driver) as fallback
        const capacity = vehicle.seatingCapacity || 0;
        const fallbackSeats = capacity > 0 ? capacity - 1 : 0;
        this.tripForm.get('noOfSeats')?.setValue(fallbackSeats);
        console.log('[selectVehicle] Using fallback seat count:', fallbackSeats, '(capacity minus driver)');
        this.cdr.detectChanges();
        console.warn('[selectVehicle] No seat layout found for', vehicle.vehicleType);
      }
    }, err => {
      this.seatLayout = null;
      this.seatLayoutError = 'Failed to load seat layout.';
      // Set noOfSeats to seatingCapacity minus 1 (for driver) as fallback on error
      const capacity = vehicle.seatingCapacity || 0;
      const fallbackSeats = capacity > 0 ? capacity - 1 : 0;
      this.tripForm.get('noOfSeats')?.setValue(fallbackSeats);
      console.log('[selectVehicle] Error fallback - using seat count:', fallbackSeats, '(capacity minus driver)');
      this.cdr.detectChanges();
      console.error('[selectVehicle] Error loading seat layout:', err);
    });
    // No generateBudgetGenId here
    // Reload drivers if user has selected to load by vehicle BP code
    if (this.loadDriversByVehicleBP) {
      this.loadDrivers();
      // Clear current driver selection since vehicle changed
      this.driverInput = '';
      this.tripForm.get('driverId')?.setValue('');
      this.tripForm.get('driverPhoneNo')?.setValue('');
    }
    // Clear return driver selection when vehicle changes
    this.returnDriverInput = '';
    this.tripForm.get('returnDriverId')?.setValue('');
    this.tripForm.get('returnDriverPhoneNo')?.setValue('');
  }

  updateSeatPricing() {
    if (!this.seatLayout) return;
    // Only sum prices for priceable seats (excludes driver and empty seats)
    this.seatMapTotal = this.seatLayout.seats
      .filter(seat => this.isSeatPriceable(seat.seatType))
      .reduce((sum, seat) => sum + Number(seat.price || 0), 0);
    // No budget loading here
  }

  onSeatPriceChange(seat: SeatInfo, event: Event) {
    const input = event.target as HTMLInputElement;
    seat.price = input.valueAsNumber;
    this.updateSeatPricing();
  }

  // Driver selection methods
  onDriverInput() {
    const search = this.driverInput.toLowerCase();
    this.filteredDrivers = this.drivers.filter(driver =>
      driver.name.toLowerCase().includes(search) ||
      driver.phoneNo.toLowerCase().includes(search)
    );
    this.isDriverDropdownOpen = this.filteredDrivers.length > 0;
  }

  selectDriver(driver: DriverInfoVO) {
    this.driverInput = `${driver.name} - ${driver.phoneNo}`;
    this.tripForm.get('driverId')?.setValue(driver.driverId);
    this.tripForm.get('driverPhoneNo')?.setValue(driver.phoneNo);
    this.isDriverDropdownOpen = false;
  }

  // Return Driver selection methods (for round trips)
  onReturnDriverInput() {
    const search = this.returnDriverInput.toLowerCase();
    this.filteredReturnDrivers = this.drivers.filter(driver =>
      driver.name.toLowerCase().includes(search) ||
      driver.phoneNo.toLowerCase().includes(search)
    );
    this.isReturnDriverDropdownOpen = this.filteredReturnDrivers.length > 0;
  }

  selectReturnDriver(driver: DriverInfoVO) {
    this.returnDriverInput = `${driver.name} - ${driver.phoneNo}`;
    this.tripForm.get('returnDriverId')?.setValue(driver.driverId);
    this.tripForm.get('returnDriverPhoneNo')?.setValue(driver.phoneNo);
    this.isReturnDriverDropdownOpen = false;
  }

  // Items multiselect methods
  toggleItemsDropdown() {
    this.isItemsDropdownOpen = !this.isItemsDropdownOpen;
  }

  toggleItem(item: GalleyKitchenVO) {
    const index = this.selectedItems.findIndex(selectedItem => selectedItem.itemId === item.itemId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    // Update form with selected item names
    this.tripForm.get('selectedItems')?.setValue([...this.selectedItems]);
  }

  isItemSelected(item: GalleyKitchenVO): boolean {
    return this.selectedItems.some(selectedItem => selectedItem.itemId === item.itemId);
  }

  getSelectedItemsText(): string {
    if (this.selectedItems.length === 0) return 'Select items';
    if (this.selectedItems.length === 1) return this.selectedItems[0].itemName || '';
    return `${this.selectedItems.length} items selected`;
  }

  // Method to close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdownsOnOutsideClick(event: Event) {
    const target = event.target as HTMLElement;

    // Close items dropdown
    const itemsDropdown = target.closest('.items-dropdown-container');
    if (!itemsDropdown && this.isItemsDropdownOpen) {
      this.isItemsDropdownOpen = false;
    }

    // Close budget dropdown
    const budgetDropdown = target.closest('.dropdown');
    const budgetButton = target.closest('.dropdown-toggle');
    if (!budgetDropdown && !budgetButton && this.isBudgetDropdownOpen) {
      this.isBudgetDropdownOpen = false;
    }
  }

  calculateTripCost() {
    // Enhanced calculation with route-based pricing
    const routeCode1 = this.tripForm.get('routeCode1')?.value;
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    const noOfSeats = this.tripForm.get('noOfSeats')?.value || 1;

    if (routeCode1 && vehicleId) {
      // If no budget is found after loading, use default calculation
      if (!this.selectedBudgetVersion) {
        // Find the selected route for distance-based calculation
        const selectedRoute = this.routeMaps.find(route => route.routeMapCode === routeCode1);
        let basePrice = 1000; // Default base price

        if (selectedRoute && selectedRoute.distanceKm) {
          // Calculate price based on distance (₹10 per km as base rate)
          basePrice = selectedRoute.distanceKm * 10;
        }

        // Apply multiplier for round trip
        const multiplier = this.tripType === 'roundtrip' ? 2 : 1;
        const defaultTripCost = basePrice * multiplier;
        const defaultCostPerSeat = defaultTripCost / noOfSeats;

        // Only use default values if no budget is selected
        if (!this.selectedBudgetVersion) {
          this.tripCost = defaultTripCost;
          this.costPerSeat = defaultCostPerSeat;
          this.budgetLastUpdated = new Date();
        }
      }

      // Log for debugging
      console.log('Trip cost calculated:', {
        routeCode: routeCode1,
        tripType: this.tripType,
        budgetGenId: this.budgetGenId,
        hasBudget: !!this.selectedBudgetVersion,
        totalCost: this.tripCost,
        costPerSeat: this.costPerSeat
      });
    } else {
      // Clear budget when route or vehicle not selected
      this.budgetGenId = '';
      this.availableBudgetVersions = [];
      this.selectedBudgetVersion = null;
      this.clearBudgetValues();
    }
  }

  generateBudgetGenId() {
    // Clear previous budget values
    this.clearBudgetValues();

    const tripType = this.tripType || 'oneway';
    const vehicleId = this.tripForm.get('vehicleId')?.value;
    const routeCode1 = this.tripForm.get('routeCode1')?.value;
    const routeCode2 = this.tripForm.get('routeCode2')?.value;

    if (!vehicleId || !routeCode1) {
      this.budgetGenId = '';
      this.availableBudgetVersions = [];
      this.selectedBudgetVersion = null;
      return;
    }

    // Find selected vehicle to get vehicle type
    const selectedVehicle = this.vehicles.find(v => v.vehicleId === vehicleId);
    const vehicleType = selectedVehicle?.vehicleType || 'Unknown';

    // Generate BudgetGenId based on trip type, vehicle type, and route(s) only (not seating)
    if (tripType === 'roundtrip' && routeCode2) {
      this.budgetGenId = `Round Trip_${vehicleType}_${routeCode1}_${routeCode2}`;
    } else {
      this.budgetGenId = `One Way_${vehicleType}_${routeCode1}`;
    }

    // Load available budget versions
    this.loadBudgetVersions();
  }

  loadBudgetVersions() {
    if (!this.budgetGenId) {
      this.isLoadingBudgetVersions = false;
      this.availableBudgetVersions = [];
      this.selectedBudgetVersion = null;
      this.cdr.detectChanges(); // Ensure UI updates if spinner was visible
      console.log('[loadBudgetVersions] No budgetGenId, spinner reset');
      return;
    }

    this.isLoadingBudgetVersions = true;
    this.cdr.detectChanges(); // Show spinner immediately
    console.log('[loadBudgetVersions] Loading budget versions for', this.budgetGenId);
    this.budgetPlannerService.getAllVersionsByBudgetGenId(this.budgetGenId)
      .pipe(
        catchError((error) => {
          console.error('[loadBudgetVersions] Error loading budget versions:', error);
          this.availableBudgetVersions = [];
          this.selectedBudgetVersion = null;
          this.clearBudgetValues();
          return of([]); // Return empty array so finalize is always called
        }),
        finalize(() => {
          this.isLoadingBudgetVersions = false;
          this.cdr.detectChanges(); // Always update UI when loading finishes
          console.log('[loadBudgetVersions] Spinner reset (finalize)');
        })
      )
      .subscribe((versions: BudgetPlannerVO[]) => {
        this.availableBudgetVersions = versions.sort((a, b) => (b.budgetVersion || 0) - (a.budgetVersion || 0));
        // Auto-select the latest version if available
        if (this.availableBudgetVersions.length > 0) {
          this.selectedBudgetVersion = this.availableBudgetVersions[0];
          this.applySelectedBudget();
        } else {
          this.selectedBudgetVersion = null;
          this.clearBudgetValues();
        }
        this.cdr.detectChanges(); // Ensure UI updates after data is set
        console.log(`[loadBudgetVersions] Loaded ${this.availableBudgetVersions.length} budget versions for ${this.budgetGenId}`);
      });
  }

  selectBudgetVersion(budget: BudgetPlannerVO) {
    this.selectedBudgetVersion = budget;
    this.isBudgetDropdownOpen = false;
    this.applySelectedBudget();
  }

  applySelectedBudget() {
    if (this.selectedBudgetVersion) {
      this.tripCost = this.selectedBudgetVersion.tripCost || 0;
      this.costPerSeat = this.selectedBudgetVersion.costPerSeat || 0;
      this.budgetLastUpdated = this.selectedBudgetVersion.updationDate || new Date();

      // Update form with budget ID
      this.tripForm.get('budgetId')?.setValue(this.selectedBudgetVersion.budgetId);

      console.log('Applied budget version:', this.selectedBudgetVersion.budgetVersion, 'Cost:', this.tripCost);
    }
  }

  clearBudgetValues() {
    // Clear budget-related values when no budget is available
    this.tripCost = 0;
    this.costPerSeat = 0;
    this.budgetLastUpdated = null;
    this.tripForm.get('budgetId')?.setValue(null);

    console.log('Cleared budget values - no budget available for current configuration');
  }

  toggleBudgetDropdown() {
    if (this.availableBudgetVersions.length > 0) {
      this.isBudgetDropdownOpen = !this.isBudgetDropdownOpen;
    }
  }

  closeBudgetDropdown() {
    setTimeout(() => { this.isBudgetDropdownOpen = false; }, 200);
  }

  getSelectedBudgetText(): string {
    if (!this.selectedBudgetVersion) {
      return this.availableBudgetVersions.length > 0 ? 'Select budget version' : 'No budget versions available';
    }
    return `Version ${this.selectedBudgetVersion.budgetVersion} - ₹${this.selectedBudgetVersion.tripCost?.toFixed(2) || '0.00'}`;
  }

  // Helper method to get route by code
  getRouteByCode(routeCode: string): RouteMapVO | undefined {
    return this.routeMaps.find(route => route.routeMapCode === routeCode);
  }

  // Helper method to validate route selection
  validateRouteSelection(): boolean {
    const routeCode1 = this.tripForm.get('routeCode1')?.value;
    if (routeCode1) {
      const route = this.getRouteByCode(routeCode1);
      if (!route) {
        this.messageDialog.openDialog('Error', 'Selected route code is not valid. Please select from the dropdown.', 'Close');
        return false;
      }
    }

    if (this.tripType === 'roundtrip') {
      const routeCode2 = this.tripForm.get('routeCode2')?.value;
      if (routeCode2) {
        const route = this.getRouteByCode(routeCode2);
        if (!route) {
          this.messageDialog.openDialog('Error', 'Selected return route code is not valid. Please select from the dropdown.', 'Close');
          return false;
        }
      }
    }

    return true;
  }

  // Dropdown close methods
  closeFromRouteDropdown() {
    setTimeout(() => { this.isFromRouteDropdownOpen = false; }, 200);
  }

  closeToRouteDropdown() {
    setTimeout(() => { this.isToRouteDropdownOpen = false; }, 200);
  }

  closeRtFromRouteDropdown() {
    setTimeout(() => { this.isRtFromRouteDropdownOpen = false; }, 200);
  }

  closeRtToRouteDropdown() {
    setTimeout(() => { this.isRtToRouteDropdownOpen = false; }, 200);
  }

  closeVehicleDropdown() {
    setTimeout(() => { this.isVehicleDropdownOpen = false; }, 200);
  }

  closeDriverDropdown() {
    setTimeout(() => { this.isDriverDropdownOpen = false; }, 200);
  }

  closeReturnDriverDropdown() {
    setTimeout(() => { this.isReturnDriverDropdownOpen = false; }, 200);
  }

  closeItemsDropdown() {
    setTimeout(() => { this.isItemsDropdownOpen = false; }, 200);
  }

  // CRUD Operations
  onLoadCreate() {
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = false;
    this.isEdit = true;
    this.isCalendarView = false;
    this.showTripReports = false
    this.initializeForm();
    this.resetForm();
  }

  onCreate() {
    if (this.tripForm.valid && this.validateRouteSelection()) {
      // Block if no budget is defined
      if (this.availableBudgetVersions.length === 0) {
        this.messageDialog.openDialog('Error', 'No budget is defined for the selected route and vehicle. Cannot plan trip or generate LTP.', 'Close');
        return;
      }
      // Only validate seat pricing if seat selection is enabled
      if (this.enableSeatSelection) {
        // Use tolerance-based comparison for floating-point numbers (0.01 = 1 paisa tolerance)
        const difference = Math.abs(this.seatMapTotal - this.tripCost);
        const tolerance = 0.01;
        
        if (difference > tolerance) {
          let msg = '';
          if (this.seatMapTotal > this.tripCost) {
            msg = `Total Seats Cost (₹${this.seatMapTotal.toFixed(2)}) exceeds Trip Cost (₹${this.tripCost.toFixed(2)}). Please adjust seat pricing.`;
          } else {
            msg = `Total Seats Cost (₹${this.seatMapTotal.toFixed(2)}) is less than Trip Cost (₹${this.tripCost.toFixed(2)}). Please adjust seat pricing.`;
          }
          this.messageDialog.openDialog('Error', msg, 'Close');
          return;
        }
      }
      // Check if it's LTP
      if (this.tripForm.get('isLtp')?.value) {
        this.generateLtpTrips();
        // Only set UI state after trips are generated
        if (this.ltpTrips.length > 0) {
          this.isShow = false;
          this.isLtpPreview = true;
        }
      } else {
        this.createSingleTrip();
      }
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all required fields and ensure valid route selection', 'Close');
      this.tripForm.markAllAsTouched();
    }
  }

  createSingleTrip() {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    const formValue = this.tripForm.value;
    let itemName = '';
    let itemIds = '';
    if (formValue.selectedItems && Array.isArray(formValue.selectedItems)) {
      itemName = formValue.selectedItems.map((item: any) => item.itemName).join(', ');
      itemIds = formValue.selectedItems.map((item: any) => item.itemId).join(',');
    }
    // Map fleetId from FleetMaintenanceVO using vehicleId
    let fleetId = 0;
    if (formValue.vehicleId) {
      const fleetInfo = this.fleetMaintenanceList?.find(f => f.vehicleId === formValue.vehicleId);
      if (fleetInfo && fleetInfo.fleetId) {
        fleetId = fleetInfo.fleetId;
      }
    }
    // Attach board/drop selections to tripData (if needed by backend, otherwise remove)
    const tripData: any = {
      tripPlannerId: 0,
      tripGroupId: '',
      tripId: 0,
      tripType: formValue.tripType || '',
      isLtp: !!formValue.isLtp,
      routeCode1: formValue.routeCode1 || '',
      routeCode2: (formValue.tripType === 'roundtrip') ? (formValue.routeCode2 || '') : '',
      fromLoc: formValue.fromLoc || '',
      toLoc: formValue.toLoc || '',
      srcStartDate: this.formatDateTime(formValue.srcStartDate, formValue.srcStartTime),
      desEndDate: this.formatDateTime(formValue.desEndDate, formValue.desEndTime),
      rtFromLoc: formValue.rtFromLoc || '',
      rtToLoc: formValue.rtToLoc || '',
      rtSrcStartDate: this.formatDateTime(formValue.rtSrcStartDate, formValue.rtSrcStartTime),
      rtDesEndDate: this.formatDateTime(formValue.rtDesEndDate, formValue.rtDesEndTime),
      vehicleId: formValue.vehicleId || 0,
      vehicleCode: formValue.vehicleCode || '',
      fleetId: fleetId || 0,
      driverId: formValue.driverId || 0,
      driverPhoneNo: formValue.driverPhoneNo || '',
      returnDriverId: formValue.returnDriverId || 0,
      returnDriverPhoneNo: formValue.returnDriverPhoneNo || '',
      budgetId: formValue.budgetId || 0,
      tripCost: this.tripCost || 0,
      noOfSeats: formValue.noOfSeats || 0,
      costPerSeat: this.costPerSeat || 0,
      itemName: itemName || '',
      itemIds: itemIds || '',
      tripStatus: 'Planned',
      createdBy: '',
      updatedBy: '',
      creationDate: new Date(),
      updationDate: new Date(),
      seatPricing: this.enableSeatSelection ? (this.seatLayout ? this.seatLayout.seats : []) : undefined
      // boardDropSelections: this.boardDropSelections // Uncomment if backend expects this
    };
    this.tripObj = tripData;
    console.log(this.tripObj)
    this.tripPlannerService.createTrip(this.tripObj).subscribe(
      (response: TripPlannerVO) => {
        this.messageDialog.openDialog('Success', 'Trip created successfully', 'Ok');
        this.selectedBudgetVersion = null;
        this.availableBudgetVersions = [];
        this.budgetGenId = '';
        this.tripCost = 0;
        this.costPerSeat = 0;
        this.budgetLastUpdated = null;
        this.tripForm.get('budgetId')?.setValue(null);
        this.clearBudgetValues();
        this.resetForm();
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.messageDialog.openDialog('Error', 'Failed to create trip', 'Close');
      }
    );
  }

  // Helper method to ensure proper time format
  private formatTimeValue(timeValue: string | null | undefined, defaultTime: string): string {
    console.log(`=== formatTimeValue Debug ===`, {
      input: timeValue,
      inputType: typeof timeValue,
      inputLength: timeValue?.length,
      defaultTime: defaultTime
    });

    if (!timeValue || timeValue.trim() === '') {
      console.log(`Using default time: ${defaultTime} (original was empty or null)`);
      return defaultTime;
    }

    const trimmedTime = timeValue.trim();
    console.log(`Trimmed time: "${trimmedTime}"`);

    // Check if time is in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(trimmedTime)) {
      console.log(`Time format valid: ${trimmedTime} - returning as-is`);
      return trimmedTime;
    }

    // Check if time is just hours (like "20" instead of "20:00")
    if (/^\d{1,2}$/.test(trimmedTime)) {
      const formattedTime = `${trimmedTime}:00`;
      console.log(`Time formatted from hours only: ${trimmedTime} -> ${formattedTime}`);
      return formattedTime;
    }

    // Check for other potential formats and log them
    console.log(`Invalid time format detected:`, {
      value: trimmedTime,
      regexHHMM: /^\d{1,2}:\d{2}$/.test(trimmedTime),
      regexHours: /^\d{1,2}$/.test(trimmedTime),
      charCodes: Array.from(trimmedTime).map(char => char.charCodeAt(0))
    });

    console.log(`Using default time: ${trimmedTime} -> ${defaultTime}`);
    return defaultTime;
  }


  generateLtpTrips() {
    this.ltpTrips = [];
    const form = this.tripForm.value;
    if (!form.ltpStartDate || !form.ltpEndDate) {
      this.messageDialog.openDialog('Error', 'Please select LTP start and end dates', 'Close');
      return;
    }
    const ltpStart = new Date(form.ltpStartDate);
    const ltpEnd = new Date(form.ltpEndDate);
    if (ltpStart > ltpEnd) {
      this.messageDialog.openDialog('Error', 'LTP end date must be after start date', 'Close');
      return;
    }
    let tripId = 1;
    if (this.tripType === 'oneway') {
      // Repeat the same trip pattern (same start and end time) for each day in the LTP range
      for (let d = new Date(ltpStart); d <= ltpEnd; d.setDate(d.getDate() + 1)) {
        // Calculate src and des date for this day
        const srcDateStr = d.toISOString().split('T')[0];
        // If desEndTime is before srcStartTime, roll over to next day for desEndDate
        let desDateObj = new Date(srcDateStr + 'T' + this.formatTimeValue(form.srcStartTime, form.srcStartTime));
        let desEndDateObj = new Date(srcDateStr + 'T' + this.formatTimeValue(form.desEndTime, form.desEndTime));
        if (desEndDateObj < desDateObj) {
          desEndDateObj.setDate(desEndDateObj.getDate() + 1);
        }
        const trip: TripPlannerVO = {
          tripPlannerId: 0,
          tripGroupId: '',
          tripId: tripId++,
          tripType: 'oneway',
          isLtp: true,
          routeCode1: form.routeCode1 || '',
          routeCode2: '',
          fromLoc: form.fromLoc || '',
          toLoc: form.toLoc || '',
          srcStartDate: this.formatDateTime(srcDateStr, form.srcStartTime),
          desEndDate: this.formatDateTime(desEndDateObj.toISOString().split('T')[0], this.formatTimeValue(desEndDateObj.toTimeString().slice(0,5), form.desEndTime)),
          rtFromLoc: '',
          rtToLoc: '',
          rtSrcStartDate: '',
          rtDesEndDate: '',
          vehicleId: form.vehicleId || 0,
          vehicleCode: form.vehicleCode || '',
          fleetId: form.fleetId || 0,
          driverId: form.driverId || 0,
          driverPhoneNo: form.driverPhoneNo || '',
          returnDriverId: 0,
          returnDriverPhoneNo: '',
          budgetId: form.budgetId || 0,
          tripCost: this.tripCost || 0,
          noOfSeats: form.noOfSeats || 0,
          costPerSeat: this.costPerSeat || 0,
          itemName: this.selectedItems.map(item => item.itemName).join(', '),
          itemIds: this.selectedItems.map(item => item.itemId).join(','),
          tripStatus: 'Planned',
          createdBy: '',
          updatedBy: '',
          creationDate: new Date(),
          updationDate: new Date(),
          seatPricing: this.enableSeatSelection ? (this.seatLayout ? this.seatLayout.seats : []) : undefined
        };
        this.ltpTrips.push(trip);
      }
    } else if (this.tripType === 'roundtrip') {
      // Calculate the offsets and durations from the user's original input
      const mainSrcDate = new Date(form.srcStartDate);
      const mainDesDate = new Date(form.desEndDate);
      const rtSrcDate = new Date(form.rtSrcStartDate);
      const rtDesDate = new Date(form.rtDesEndDate);
      // Main trip duration in ms
      const mainTripDurationMs = new Date(form.desEndDate + 'T' + this.formatTimeValue(form.desEndTime, form.desEndTime)).getTime() - new Date(form.srcStartDate + 'T' + this.formatTimeValue(form.srcStartTime, form.srcStartTime)).getTime();
      // Return trip offset (days) from main trip start
      const returnStartOffset = Math.round((rtSrcDate.getTime() - mainSrcDate.getTime()) / (24 * 60 * 60 * 1000));
      // Return trip duration in ms
      const returnTripDurationMs = new Date(form.rtDesEndDate + 'T' + this.formatTimeValue(form.rtDesEndTime, form.rtDesEndTime)).getTime() - new Date(form.rtSrcStartDate + 'T' + this.formatTimeValue(form.rtSrcStartTime, form.rtSrcStartTime)).getTime();
      for (let d = new Date(ltpStart); d <= ltpEnd; d.setDate(d.getDate() + 1)) {
        // Main trip
        const mainTripDateStr = d.toISOString().split('T')[0];
        let mainSrcDateObj = new Date(mainTripDateStr + 'T' + this.formatTimeValue(form.srcStartTime, form.srcStartTime));
        let mainDesDateObj = new Date(mainSrcDateObj.getTime() + mainTripDurationMs);
        // Return trip: base date is mainSrcDate + returnStartOffset days
        let rtSrcDateObj = new Date(mainSrcDateObj);
        rtSrcDateObj.setDate(rtSrcDateObj.getDate() + returnStartOffset);
        rtSrcDateObj.setHours(Number(this.formatTimeValue(form.rtSrcStartTime, form.rtSrcStartTime).split(':')[0]), Number(this.formatTimeValue(form.rtSrcStartTime, form.rtSrcStartTime).split(':')[1]), 0, 0);
        let rtDesDateObj = new Date(rtSrcDateObj.getTime() + returnTripDurationMs);
        const trip: TripPlannerVO = {
          tripPlannerId: 0,
          tripGroupId: '',
          tripId: tripId++,
          tripType: 'roundtrip',
          isLtp: true,
          routeCode1: form.routeCode1 || '',
          routeCode2: form.routeCode2 || '',
          fromLoc: form.fromLoc || '',
          toLoc: form.toLoc || '',
          srcStartDate: this.formatDateTime(mainTripDateStr, form.srcStartTime),
          desEndDate: this.formatDateTime(mainDesDateObj.toISOString().split('T')[0], this.formatTimeValue(mainDesDateObj.toTimeString().slice(0,5), form.desEndTime)),
          rtFromLoc: form.rtFromLoc || '',
          rtToLoc: form.rtToLoc || '',
          rtSrcStartDate: this.formatDateTime(rtSrcDateObj.toISOString().split('T')[0], this.formatTimeValue(rtSrcDateObj.toTimeString().slice(0,5), form.rtSrcStartTime)),
          rtDesEndDate: this.formatDateTime(rtDesDateObj.toISOString().split('T')[0], this.formatTimeValue(rtDesDateObj.toTimeString().slice(0,5), form.rtDesEndTime)),
          vehicleId: form.vehicleId || 0,
          vehicleCode: form.vehicleCode || '',
          fleetId: form.fleetId || 0,
          driverId: form.driverId || 0,
          driverPhoneNo: form.driverPhoneNo || '',
          returnDriverId: form.returnDriverId || 0,
          returnDriverPhoneNo: form.returnDriverPhoneNo || '',
          budgetId: form.budgetId || 0,
          tripCost: this.tripCost || 0,
          noOfSeats: form.noOfSeats || 0,
          costPerSeat: this.costPerSeat || 0,
          itemName: this.selectedItems.map(item => item.itemName).join(', '),
          itemIds: this.selectedItems.map(item => item.itemId).join(','),
          tripStatus: 'Planned',
          createdBy: '',
          updatedBy: '',
          creationDate: new Date(),
          updationDate: new Date(),
          seatPricing: this.enableSeatSelection ? (this.seatLayout ? this.seatLayout.seats : []) : undefined
        };
        this.ltpTrips.push(trip);
      }
    }
    this.isShow = false;
    this.isLtpPreview = this.ltpTrips.length > 0;
  }
  

  combineDateTimeFields() {
    // Combine date and time for source start
    const srcDate = this.tripForm.get('srcStartDate')?.value;
    const srcTime = this.tripForm.get('srcStartTime')?.value;
    if (srcDate && srcTime) {
      // Store combined value in srcStartDate
      this.tripObj.srcStartDate = this.formatDateTime(srcDate, srcTime);
    }

    // Combine date and time for destination end
    const desDate = this.tripForm.get('desEndDate')?.value;
    const desTime = this.tripForm.get('desEndTime')?.value;
    if (desDate && desTime) {
      // Store combined value in desEndDate
      this.tripObj.desEndDate = this.formatDateTime(desDate, desTime);
    }

    // Round trip dates
    if (this.tripType === 'roundtrip') {
      const rtSrcDate = this.tripForm.get('rtSrcStartDate')?.value;
      const rtSrcTime = this.tripForm.get('rtSrcStartTime')?.value;
      if (rtSrcDate && rtSrcTime) {
        this.tripObj.rtSrcStartDate = this.formatDateTime(rtSrcDate, rtSrcTime);
      }

      const rtDesDate = this.tripForm.get('rtDesEndDate')?.value;
      const rtDesTime = this.tripForm.get('rtDesEndTime')?.value;
      if (rtDesDate && rtDesTime) {
        this.tripObj.rtDesEndDate = this.formatDateTime(rtDesDate, rtDesTime);
      }
    }
  }

  onLoadTripList() {
    this.isListView = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isShow = false;
    this.isView = false;
    this.isEditingLtpTrip = false; // Reset LTP editing flag
    this.isViewingLtpTrip = false; // Reset LTP viewing flag
    this.currentEditingLtpTrip = null; // Clear current editing trip reference
    // Mock data - replace with actual service call
    this.trips = [];
    this.filteredTrips = this.trips;
  }

  onSearchChange() {
    this.filteredTrips = this.trips.filter(trip =>
      trip.fromLoc.toLowerCase().includes(this.searchText.toLowerCase()) ||
      trip.toLoc.toLowerCase().includes(this.searchText.toLowerCase()) ||
      trip.vehicleCode.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  resetForm() {
    this.isResettingForm = true;
    this.tripForm.reset();
    this.tripType = 'oneway';
    this.selectedItems = [];
    this.fromRouteInput = '';
    this.toRouteInput = '';
    this.rtFromRouteInput = '';
    this.rtToRouteInput = '';
    this.vehicleInput = '';
    this.driverInput = '';
    this.returnDriverInput = '';
    this.tripCost = 0;
    this.costPerSeat = 0;
    this.budgetLastUpdated = null;
    this.isLtpPreview = false;
    this.ltpTrips = [];
    this.isProcessing = false;
    this.loadDriversByVehicleBP = false; // Reset driver loading preference
    this.isEditingLtpTrip = false; // Reset LTP editing flag
    this.isViewingLtpTrip = false; // Reset LTP viewing flag
    this.currentEditingLtpTrip = null; // Clear current editing trip reference

    // Reset budget-related properties
    this.budgetGenId = '';
    this.availableBudgetVersions = [];
    this.selectedBudgetVersion = null;
    this.isBudgetDropdownOpen = false;
    this.clearBudgetValues();

    // Reset seat layout
    this.seatLayout = null;
    this.seatMapTotal = 0;
    this.seatLayoutError = '';
    this.isResettingForm = false;
  }

  onUpdate() {
    if (this.tripForm.valid) {
      this.tripObj = Object.assign({}, this.tripForm.value);
      this.tripObj.tripCost = this.tripCost;
      this.tripObj.costPerSeat = this.costPerSeat;
      this.tripObj.itemName = this.selectedItems.map(item => item.itemName).join(', ');

      // Combine date and time fields
      this.combineDateTimeFields();

      // Regular trip update only (LTP editing is no longer supported)
      this.messageDialog.openDialog('Success', 'Trip updated successfully!', 'Ok');
      this.resetForm();
      this.cdr.detectChanges();
    } else {
      this.messageDialog.openDialog('Error', 'Please fill out all required fields', 'Close');
      this.tripForm.markAllAsTouched();
    }
  }

  onDelete() {
    // Perform deletion logic here (e.g., call service to delete trip)
    this.messageDialog.openDialog('Success', 'Trip deleted successfully!', 'Ok');
    this.resetForm();
    this.onLoadTripList();
  }

  onView(tripPlannerId: number) {
    this.isShow = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = true;
    this.isEdit = false;
    // Prevent duplicate valueChanges triggers
    this.isResettingForm = true;
    this.initializeForm();
    // ...populate form with trip data here if needed...
    this.isResettingForm = false;
    // Only call generateBudgetGenId() once
    this.generateBudgetGenId();
  }

  onBack() {
    // Check if we're editing or viewing an LTP trip
    if (this.isEditingLtpTrip || this.isViewingLtpTrip) {
      // Return to LTP preview with existing data
      this.isShow = false;
      this.isCreate = false;
      this.isUpdate = false;
      this.isDelete = false;
      this.isListView = false;
      this.isView = false;
      this.isEdit = false;
      this.isLtpPreview = true;
      this.isEditingLtpTrip = false; // Reset the flag
      this.isViewingLtpTrip = false; // Reset the viewing flag
      this.currentEditingLtpTrip = null; // Clear current editing trip reference

      // Re-enable the form when going back
      this.tripForm.enable();

      // Don't reset the form or clear LTP trips data
      console.log('Returning to LTP preview with', this.ltpTrips.length, 'trips');
    } else {
      // Default back behavior -
      this.isLtpPreview = false;
      this.ltpTrips = [];
      this.onLoadTripList();
    }
  }

  onPlanAllLtpTrips() {
    if (this.ltpTrips.length === 0) {
      this.messageDialog.openDialog('Error', 'No LTP trips to plan', 'Close');
      return;
    }

    this.isProcessing = true;

    const username = String(sessionStorage.getItem('UserInfo.username') || '');
    const ltpPayload = this.ltpTrips.map(trip => {
      let fleetId = 0;
      if (trip.vehicleId) {
        const fleetInfo = this.fleetMaintenanceList?.find(f => f.vehicleId === trip.vehicleId);
        if (fleetInfo && fleetInfo.fleetId) {
          fleetId = fleetInfo.fleetId;
        }
      }
      return {
        tripPlannerId: trip.tripPlannerId ?? 0,
        tripGroupId: trip.tripGroupId ?? 0,
        tripId: trip.tripId ?? 0,
        tripType: trip.tripType ?? '',
        isLtp: trip.isLtp ?? false,
        routeCode1: trip.routeCode1 ?? '',
        routeCode2: trip.routeCode2 ?? '',
        fromLoc: trip.fromLoc ?? '',
        toLoc: trip.toLoc ?? '',
        srcStartDate: trip.srcStartDate ?? '',
        desEndDate: trip.desEndDate ?? '',
        rtFromLoc: trip.rtFromLoc ?? '',
        rtToLoc: trip.rtToLoc ?? '',
        rtSrcStartDate: trip.rtSrcStartDate ?? '',
        rtDesEndDate: trip.rtDesEndDate ?? '',
        vehicleId: trip.vehicleId ?? 0,
        vehicleCode: trip.vehicleCode ?? '',
        fleetId: fleetId,
        driverId: trip.driverId ?? 0,
        driverPhoneNo: trip.driverPhoneNo ?? '',
        returnDriverId: trip.returnDriverId ?? 0,
        returnDriverPhoneNo: trip.returnDriverPhoneNo ?? '',
        budgetId: trip.budgetId ?? (this.selectedBudgetVersion?.budgetId ?? 0),
        tripCost: trip.tripCost ?? 0,
        noOfSeats: trip.noOfSeats ?? 0,
        costPerSeat: trip.costPerSeat ?? 0,
        itemName: trip.itemName || (this.selectedItems ? this.selectedItems.map((item: any) => item.itemName).join(', ') : ''),
        itemIds: trip.itemIds || (this.selectedItems ? this.selectedItems.map((item: any) => item.itemId).join(',') : ''),
        createdBy: username,
        creationDate: trip.creationDate ?? new Date(),
        updatedBy: username,
        updationDate: trip.updationDate ?? new Date(),
        seatPricing: this.enableSeatSelection ? (this.seatLayout ? this.seatLayout.seats : undefined) : undefined
      };
    });
    this.tripPlannerService.createBulkTrips(ltpPayload as any).subscribe(
      (response: any) => {
        this.isProcessing = false;
        this.messageDialog.openDialog('Success', 'Bulk trips created successfully', 'Ok');
        this.resetForm();
        this.isLtpPreview = false;
        this.ltpTrips = [];
        this.onLoadTripList();
      },
      (error: any) => {
        this.isProcessing = false;
        this.messageDialog.openDialog('Error', 'Failed to plan LTP trips. Please try again.', 'Close');
      }
    );
  }

  onViewLtpTrip(trip: TripPlannerVO) {
    // Load the specific trip for viewing in read-only mode
    this.isShow = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isLtpPreview = false;
    this.isView = true;
    this.isEdit = false;
    this.isEditingLtpTrip = false; // Not editing, just viewing
    this.isViewingLtpTrip = true; // Set flag to indicate we're viewing an LTP trip
    this.currentEditingLtpTrip = trip; // Store reference for navigation back
    this.isResettingForm = true;
    this.initializeForm();
    this.populateFormWithTrip(trip);

    // Disable the entire form for read-only viewing
    this.tripForm.disable();
  }

  onDeleteLtpTrip(tripIndex: number) {
    if (tripIndex >= 0 && tripIndex < this.ltpTrips.length) {
      this.ltpTrips.splice(tripIndex, 1);
      this.messageDialog.openDialog('Success', 'Trip removed from LTP plan', 'Ok');
    }
  }

  populateFormWithTrip(trip: TripPlannerVO) {
    // Set trip type first to ensure proper validation
    this.tripType = trip.tripType || 'oneway';

    this.tripForm.patchValue({
      tripType: trip.tripType,
      isLtp: trip.isLtp,
      routeCode1: trip.routeCode1,
      fromLoc: trip.fromLoc,
      toLoc: trip.toLoc,
      vehicleId: trip.vehicleId,
      vehicleCode: trip.vehicleCode,
      driverId: trip.driverId,
      driverPhoneNo: trip.driverPhoneNo,
      returnDriverId: trip.returnDriverId,
      returnDriverPhoneNo: trip.returnDriverPhoneNo,
      noOfSeats: trip.noOfSeats,
      routeCode2: trip.routeCode2,
      rtFromLoc: trip.rtFromLoc,
      rtToLoc: trip.rtToLoc,
      mainTripFrequency: trip.mainTripFrequency || '',
      returnTripOffset: trip.returnTripOffset || ''
    });

    // Populate route input fields for display
    if (trip.routeCode1 && trip.fromLoc && trip.toLoc) {
      this.fromRouteInput = `${trip.routeCode1} - ${trip.fromLoc} to ${trip.toLoc}`;
    }

    if (trip.routeCode2 && trip.rtFromLoc && trip.rtToLoc) {
      this.rtFromRouteInput = `${trip.routeCode2} - ${trip.rtFromLoc} to ${trip.rtToLoc}`;
    }

    // Populate vehicle input field
    if (trip.vehicleCode) {
      const selectedVehicle = this.vehicles.find(v => v.vehicleId === trip.vehicleId);
      if (selectedVehicle) {
        this.vehicleInput = `${selectedVehicle.vehicleCode} - ${selectedVehicle.vehicleType}`;
      }
    }

    // Populate driver input field
    if (trip.driverPhoneNo) {
      const selectedDriver = this.drivers.find(d => d.driverId === trip.driverId);
      if (selectedDriver) {
        this.driverInput = `${selectedDriver.name} - ${selectedDriver.phoneNo}`;
      }
    }

    // Populate return driver input field (for round trips)
    if (trip.returnDriverPhoneNo) {
      const selectedReturnDriver = this.drivers.find(d => d.driverId === trip.returnDriverId);
      if (selectedReturnDriver) {
        this.returnDriverInput = `${selectedReturnDriver.name} - ${selectedReturnDriver.phoneNo}`;
      }
    }

    // Set date and time fields from trip's DateTime strings (always use full Date object)
    const setDateAndTime = (dateTimeStr: string, dateField: string, timeField: string) => {
      if (dateTimeStr) {
        try {
          const dt = new Date(dateTimeStr);
          const dateStr = dt.getFullYear() + '-' +
            String(dt.getMonth() + 1).padStart(2, '0') + '-' +
            String(dt.getDate()).padStart(2, '0');
          const timeStr = String(dt.getHours()).padStart(2, '0') + ':' +
            String(dt.getMinutes()).padStart(2, '0');
          this.tripForm.get(dateField)?.setValue(dateStr);
          this.tripForm.get(timeField)?.setValue(timeStr);
        } catch (error) {
          console.error(`Error parsing ${dateField}:`, error);
        }
      }
    };

    setDateAndTime(trip.srcStartDate, 'srcStartDate', 'srcStartTime');
    setDateAndTime(trip.desEndDate, 'desEndDate', 'desEndTime');
    if (trip.tripType === 'roundtrip') {
      setDateAndTime(trip.rtSrcStartDate, 'rtSrcStartDate', 'rtSrcStartTime');
      setDateAndTime(trip.rtDesEndDate, 'rtDesEndDate', 'rtDesEndTime');
    }

    // Set selected items
    if (trip.itemName) {
      const itemNames = trip.itemName.split(', ').filter(item => item.trim() !== '');
      this.selectedItems = this.availableItems.filter(item =>
        itemNames.includes(item.itemName || '')
      );
    }

    // Set budget if applicable
    if (trip.budgetId && this.availableBudgetVersions.length > 0) {
      const matchedBudget = this.availableBudgetVersions.find(b => b.budgetId === trip.budgetId);
      if (matchedBudget) {
        this.selectedBudgetVersion = matchedBudget;
        this.tripForm.get('budgetId')?.setValue(matchedBudget.budgetId);
        this.budgetGenId = matchedBudget.budgetGenId || '';
        this.budgetLastUpdated = matchedBudget.updationDate ? new Date(matchedBudget.updationDate) : null;
      }
    } else {
      this.selectedBudgetVersion = null;
      this.tripForm.get('budgetId')?.setValue(null);
      this.budgetGenId = '';
      this.budgetLastUpdated = null;
    }

    // Set trip costs
    this.tripCost = trip.tripCost || 0;
    this.costPerSeat = trip.costPerSeat || 0;

    // Update validators based on trip type
    this.updateValidators();

    // Debug log
    console.log('Populated form with trip data:', {
      tripId: trip.tripId,
      tripType: trip.tripType,
      srcStartDate: trip.srcStartDate,
      desEndDate: trip.desEndDate,
      rtSrcStartDate: trip.rtSrcStartDate,
      rtDesEndDate: trip.rtDesEndDate
    });
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }

  // Handler for Plan Trip from Calendar View
  onPlanTripFromCalendar() {
    this.isCalendarView = false;
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = false;
    this.isEdit = true;
    this.isLtpPreview = false;
    this.isEditingLtpTrip = false;
    this.isViewingLtpTrip = false;
    this.currentEditingLtpTrip = null;
    this.initializeForm();
    this.resetForm();
  }

  showTripReport(){
    this.isCalendarView = false;
    this.showTripReports = true;  
    this.isShow = false;
    this.isCreate = false;  
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = false;
    this.isEdit = false;
    this.isLtpPreview = false;
    this.isEditingLtpTrip = false;
    this.isViewingLtpTrip = false;
    this.currentEditingLtpTrip = null;
  }

  refreshTrips() {
    this.tripPlannerService.getAllTrips().subscribe(
      (data) => {
        this.trips = Array.isArray(data) ? data : [];
      },
      (error) => {
        this.trips = [];
        console.error('Error loading trips for calendar view:', error);
      }
    );
  }
}
