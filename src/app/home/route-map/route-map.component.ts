import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';
import { MessageDialogService } from 'src/app/services/message-dialog.service';

import { Router } from '@angular/router';
import { RouteMapVO } from 'src/app/model/routeMapVO.model';
import { RouteMapService } from 'src/app/services/routeMap.service';
import { BoardDropPointService } from 'src/app/services/boardDropPoint.service';
import { RoutePlaceService } from 'src/app/services/routePlace.service';
import { StopMapVO } from 'src/app/model/stopMapVO.model';

@Component({
  selector: 'app-route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.scss']
})
export class RouteMapComponent implements OnInit {
    // --- RouteMap Code Autocomplete for Modal ---
    routeMapCodeInput: string = '';
    filteredRouteMapCodeArr: string[] = [];
    isRouteMapCodeDropdownOpen: boolean = false;

    isShow: boolean = false;
    isCreate: boolean = false;
    isUpdate: boolean = false;
    isDelete: boolean = false;
    isListView: boolean = false; 
    isView: boolean = false;
    isEdit: boolean = false;
    isFormDirty: boolean = false;
    routeMapForm!: FormGroup;
    routeMapCode: string = '';
    routeMapCodeArr: string[] = []; // Replace with API data
    routeMapVO: RouteMapVO = new RouteMapVO();
    locationArr: string[] = []; 
    viaLocationArr: string[] = [];
    viaLocation: string = '';
      viaType: string = '';
      viaPlace: string = '';
      viaPlaces: any[] = [];
    
    // Stop Locations
    stopLocations: string[] = [];
    stopLocationInput: string = '';
    filteredStopLocations: string[] = [];
    isStopLocationDropdownOpen: boolean = false;
    showStopValidation: boolean = false;
    selectedStopLocation: string = '';
    selectedStopPlace: string = '';
    
    // (Removed viaPoints logic as per new requirements)
    
    routeMap: any[] = [];  // Store fetched partners
    filteredRoute: any[] = []; // Store search results
    searchText: string = ''; // Bind search input
  
    constructor(private formBuilder: FormBuilder,
      private messageDialog: MessageDialogService,
      private routeMapService: RouteMapService,
      private boardDropPointService: BoardDropPointService,
      private routePlaceService: RoutePlaceService,
      private router: Router) {
    }
  
    ngOnInit(): void {
      this.routeMapService.getAllRouteCode().subscribe((data) => {
        this.routeMapCodeArr = data;
        this.filteredRouteMapCodeArr = data;
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
      this.routeMapService.getAllLocation().subscribe((data) => {
        this.locationArr = data;
        this.viaLocationArr = data;
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
        this.loadViaPlaces();
  }

  validateFromToLocation(event: Event) {
    const target = event.target as HTMLSelectElement;
    const changedValue = target.getAttribute('formControlName') === 'fromLocation' ? 'fromLocation' : 'toLocation';
    
    const from = this.routeMapForm.get('fromLocation')?.value;
    const to = this.routeMapForm.get('toLocation')?.value;

    if (from && to && from === to) {
      this.messageDialog.openDialog('Error', 'From Location and To Location cannot be the same', 'Close', 'error');
      this.routeMapForm.get(changedValue)?.reset();
    }
  }

    loadViaPlaces() {
      this.routePlaceService.getAll().subscribe((places: any[]) => {
        this.viaPlaces = places;
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
    }

    onViaLocationChange(value: string) {
      // Handle via location change if needed
      console.log('Via location changed:', value);
    }


  onRouteMapCodeInput() {
    if (!this.routeMapCodeInput) {
      this.filteredRouteMapCodeArr = this.routeMapCodeArr;
      this.isRouteMapCodeDropdownOpen = false;
      return;
    }
    const search = this.routeMapCodeInput.toLowerCase();
    this.filteredRouteMapCodeArr = this.routeMapCodeArr.filter((code: string) => code.toLowerCase().includes(search));
    this.isRouteMapCodeDropdownOpen = this.filteredRouteMapCodeArr.length > 0;
  }

  selectRouteMapCode(code: string) {
    this.routeMapCodeInput = code;
    this.routeMapCode = code;
    this.filteredRouteMapCodeArr = [];
    this.isRouteMapCodeDropdownOpen = false;
  }

  closeRouteMapCodeDropdown() {
    setTimeout(() => { this.isRouteMapCodeDropdownOpen = false; }, 200);
  }

  // Stop Location Methods
  onStopLocationInput() {
    if (!this.stopLocationInput) {
      this.filteredStopLocations = [];
      this.isStopLocationDropdownOpen = false;
      return;
    }
    const search = this.stopLocationInput.toLowerCase();
    this.filteredStopLocations = this.locationArr.filter((location: string) => 
      location.toLowerCase().includes(search) && !this.stopLocations.includes(location)
    );
    this.isStopLocationDropdownOpen = this.filteredStopLocations.length > 0;
  }

  addStopLocation(location: string) {
    if (location && !this.stopLocations.includes(location)) {
      this.stopLocations.push(location);
      this.stopLocationInput = '';
      this.filteredStopLocations = [];
      this.isStopLocationDropdownOpen = false;
      this.showStopValidation = false;
      this.isFormDirty = true; // Mark form as dirty when stops change
      // Clear selected dropdowns after adding
      if (this.selectedStopLocation === location) {
        this.selectedStopLocation = '';
      }
      if (this.selectedStopPlace === location) {
        this.selectedStopPlace = '';
      }
    } else {
      this.messageDialog.openDialog('Error', 'Stop location already added. Please select new stop location', 'Close', 'error');
    }
  }

  removeStopLocation(index: number) {
    this.stopLocations.splice(index, 1);
    this.isFormDirty = true; // Mark form as dirty when stops change
  }

  closeStopLocationDropdown() {
    setTimeout(() => { this.isStopLocationDropdownOpen = false; }, 200);
  }
  
  // (Removed viaPoints methods as per new requirements)
  
    initializeForm() {
      this.routeMapForm = this.formBuilder.group({
        routeMapId: [''],
        routeMapCode: [''],
        fromLocation: ['', Validators.required],
        viaType: [''],
        viaLocation: [''],
        viaPlace: [''],
        toLocation: ['', Validators.required],
        distanceKm: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]], // e.g. 123.45
        tollCount: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // e.g. 5
        driverBeta: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')]] // e.g. 100.50
      });

      // Track form changes for update button enable/disable
      this.routeMapForm.valueChanges.subscribe(() => {
        this.isFormDirty = true;
      });
    }

    enableFormControls() {
      // Enable all form controls
      this.routeMapForm.get('fromLocation')?.enable();
      this.routeMapForm.get('toLocation')?.enable();
      this.routeMapForm.get('viaType')?.enable();
      this.routeMapForm.get('viaLocation')?.enable();
      this.routeMapForm.get('viaPlace')?.enable();
      this.routeMapForm.get('tollCount')?.enable();
      this.routeMapForm.get('distanceKm')?.enable();
      this.routeMapForm.get('driverBeta')?.enable();
    }

    disableFormControls() {
      // Disable core route definition controls during edit
      this.routeMapForm.get('fromLocation')?.disable();
      this.routeMapForm.get('toLocation')?.disable();
      this.routeMapForm.get('viaType')?.disable();
      this.routeMapForm.get('viaLocation')?.disable();
      this.routeMapForm.get('viaPlace')?.disable();
      // Keep operational fields enabled
      this.routeMapForm.get('tollCount')?.enable();
      this.routeMapForm.get('distanceKm')?.enable();
      this.routeMapForm.get('driverBeta')?.enable();
    }

   // tollCost: ['', [Validators.required,Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
   //  permitCost: ['', [Validators.required,Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
  
    onCreateRouteMap() {
      this.isShow = true;
      this.isCreate = true;
      this.isUpdate = false;
      this.isDelete = false;
      this.isListView = false;
      this.isEdit = true;
      this.stopLocations = [];
      this.initializeForm();
      this.isFormDirty = false; // Reset dirty state for new form
      // Enable all form controls for create mode
      this.enableFormControls();
    }
  
    onCreate() {
      this.showStopValidation = false;
      if (this.stopLocations.length === 0) {
        this.showStopValidation = true;
        this.messageDialog.openDialog('Error', 'Please add at least one stop location', 'Close');
        return;
      }
      if (this.routeMapForm.valid) {
        this.routeMapVO = Object.assign({}, this.routeMapForm.value);
        // No viaPoints in payload, so skip deletion
        // Build stopMapList for payload
        this.routeMapVO.stopMapList = this.stopLocations.map((stop, idx) => {
          let placeId: number = 0;
          let routeId: number | null = null;
          const placeObj = this.viaPlaces.find((p: any) => p.placeName === stop);
          if (placeObj) {
            placeId = Number(placeObj.placeId);
            routeId = null;
          } else {
            placeId = 0;
            const locIdx = this.locationArr.indexOf(stop);
            routeId = locIdx >= 0 ? locIdx + 1 : null;
          }
          return {
            stopName: stop,
            sortNumber: idx + 1,
            placeId: placeId,
            routeId: routeId,
            createdBy: String(sessionStorage.getItem('UserInfo.username') || ''),
            updatedBy: String(sessionStorage.getItem('UserInfo.username') || '')
          } as StopMapVO;
        });
        this.routeMapService.createRoute(this.routeMapVO)
          .subscribe(
            (resp: any) => {
              console.log('Create RouteMap Response:', resp);
              if (resp.message === "Success") {
                let message = 'Route Map Creation Successfull!! ' + resp.subMessage;
                this.messageDialog.openDialog('Info', message, 'Ok');
                this.routeMapForm.reset();
                this.stopLocations = [];
                // (Removed: no viaPointsArr)
                this.routeMapService.getAllRouteCode().subscribe((data) => {
                  this.routeMapCodeArr = data;
                },
                (error) => {
                  console.log(error.error.error);
                  this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
                });
              } else if (resp.message === "Already exist") {
                let message = 'Mapping already exist for the selected location';
                this.messageDialog.openDialog('Info', message, 'Ok');
                this.routeMapForm.reset();
                this.stopLocations = [];
                // (Removed: no viaPointsArr)
                this.routeMapService.getAllRouteCode().subscribe((data) => {
                  this.routeMapCodeArr = data;
                },
                (error) => {
                  console.log(error.error.error);
                  this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
                });
              } else {
                this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
                this.routeMapForm.reset();
                this.stopLocations = [];
                // (Removed: no viaPointsArr)
              }
            },
        (error) => {
          console.log(error.error.error);
          this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
        } )
      } else {
        this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
        this.routeMapForm.markAllAsTouched();
      }
    }
  
    onSearch() {
      this.isCreate = false;
      this.isUpdate = true;
      this.isDelete = true;
      this.isView = false;
      this.isListView = false;
      this.isEdit = true;
      this.initializeForm();

      if (!this.routeMapCode) {
        alert('Please enter RouteMap Code!');
        return;
      }

      this.routeMapService.getRouteByCode(this.routeMapCode).subscribe((data) => {
        if (data) {
          this.routeMapForm.patchValue(data);
          // Set viaType based on response data
          if (data.viaLocation) {
            this.routeMapForm.get('viaType')?.setValue('location');
          } else if (data.viaPlace) {
            this.routeMapForm.get('viaType')?.setValue('place');
          }
          // Map stopMapList to stopLocations (use stopName)
          this.stopLocations = (data.stopMapList || []).map((stop: any) => stop.stopName);
          this.isFormDirty = false; // Reset dirty state after loading data
          this.isShow = true; // Show form with details
          // Disable core route controls during edit
          this.disableFormControls();
        } else {
          alert('No RouteMap found with this Route Code!');
        }
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
    }
  
    onUpdate() {
      this.showStopValidation = false;
      this.isFormDirty = false; // Reset dirty state after update
      if (this.stopLocations.length === 0) {
        this.showStopValidation = true;
        this.messageDialog.openDialog('Error', 'Please add at least one stop location', 'Close');
        return;
      }
      if (this.routeMapForm.valid) {
        this.routeMapVO = Object.assign({}, this.routeMapForm.getRawValue());
        // Build stopMapList for payload (same logic as onCreate)
        this.routeMapVO.stopMapList = this.stopLocations.map((stop, idx) => {
          let placeId: number = 0;
          let routeId: number | null = null;
          const placeObj = this.viaPlaces.find((p: any) => p.placeName === stop);
          if (placeObj) {
            placeId = Number(placeObj.placeId);
            routeId = null;
          } else {
            placeId = 0;
            const locIdx = this.locationArr.indexOf(stop);
            routeId = locIdx >= 0 ? locIdx + 1 : null;
          }
          return {
            stopName: stop,
            sortNumber: idx + 1,
            placeId: placeId,
            routeId: routeId,
            createdBy: String(sessionStorage.getItem('UserInfo.username') || ''),
            updatedBy: String(sessionStorage.getItem('UserInfo.username') || '')
          } as StopMapVO;
        });
        this.routeMapService.updateRoute(this.routeMapCode, this.routeMapVO)
          .subscribe(
            (resp: any) => {
              if (resp.message === "Success") {
                let message = 'RouteMap Updation Successfull!! ' + resp.subMessage;
                this.messageDialog.openDialog('Info', message, 'Ok');
              } else {
                this.messageDialog.openDialog('Error', 'Please verify your info', 'Close');
                this.routeMapCode = '';
                this.routeMapForm.reset();
                this.stopLocations = [];
              }
            },
            (error) => {
              console.log(error.error.error);
              this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
            })
      } else {
        this.messageDialog.openDialog('Error', 'Please fill out all the fields', 'Close');
        this.routeMapForm.markAllAsTouched();
      }
    }
  
    onView(routeMapCode: string) {
      this.routeMapCode = routeMapCode;
      this.isCreate = false;
      this.isUpdate = true;
      this.isDelete = true;
      this.isListView = false;
      this.isView = false;
      this.isEdit = true;
      this.initializeForm();
      this.routeMapService.getRouteByCode(this.routeMapCode).subscribe((data) => {
        if (data) {
          this.routeMapForm.patchValue(data);
          // Set viaType based on response data
          if (data.viaLocation) {
            this.routeMapForm.get('viaType')?.setValue('location');
          } else if (data.viaPlace) {
            this.routeMapForm.get('viaType')?.setValue('place');
          }
          // Map stopMapList to stopLocations (use stopName)
          this.stopLocations = (data.stopMapList || []).map((stop: any) => stop.stopName);
          this.isFormDirty = false; // Reset dirty state after loading data
          this.isShow = true; // Show form with details
          // Disable core route controls during edit
          this.disableFormControls();
        }
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
    }
  
    onDelete() {
      this.routeMapService.deleteRoute(this.routeMapCode)
        .subscribe(
          (resp: string) => {
            this.messageDialog.openDialog('Info', resp, 'Ok');
            this.routeMapForm.reset();
            this.routeMapCode = '';
          },
          (error) => {
            console.log(error.error.error);
            this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
          })
    }
  
    onLoadRouteMapList() {
      this.isListView = true; // Show table
      this.isCreate = false;
      this.isUpdate = false;
      this.isShow = false;
      this.isView = false;
      this.isEdit = false;
  
      this.routeMapService.getAllRoutes().subscribe((data) => {
        this.routeMap = data;
        this.filteredRoute = data; // Initialize filtered data
        
      },
      (error) => {
        console.log(error.error.error);
        this.messageDialog.openDialog('Error', error.error.error, 'Close', 'error');
      });
    }
  
    onSearchChange() {
      this.filteredRoute = this.routeMap.filter(route => {
        const searchLower = this.searchText.toLowerCase();
        const matchesBasic = 
          route.routeMapCode.toLowerCase().includes(searchLower) ||
          route.fromLocation.toLowerCase().includes(searchLower) ||
          (route.viaLocation && route.viaLocation.toLowerCase().includes(searchLower)) ||
          route.toLocation.toLowerCase().includes(searchLower);
        
        const matchesStops = route.stopMapList && route.stopMapList.some((stop: any) => 
          stop.stopName.toLowerCase().includes(searchLower)
        );
        
        return matchesBasic || matchesStops;
      });
    }
    
    onNavigateHome() {
      this.router.navigate(['/home']);
    }
}
