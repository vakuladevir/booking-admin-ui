// ...existing code...
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardDropPointVO } from 'src/app/model/boardDropPointVO.model';
import { BoardDropPointService } from 'src/app/services/boardDropPoint.service';
import { RouteMapService } from 'src/app/services/routeMap.service';
import { MessageDialogService } from 'src/app/services/message-dialog.service';
import { RoutePlaceService } from 'src/app/services/routePlace.service';
import { RoutePlaceVO } from 'src/app/model/routePlaceVO.model';

interface LocationOption {
  routeId: number;
  routeLocation: string;
}



@Component({
  selector: 'app-board-drop',
  templateUrl: './board-drop.component.html',
  styleUrls: ['./board-drop.component.scss']
})
export class BoardDropComponent implements OnInit {
    // ...existing code...

    // Helper to get Place Name by routeId for List View
    getPlaceNameByRouteId(routeId: number): string {
      // Find the first drop point for this routeId
      const points = this.getPointsByRouteId(routeId);
      if (points && points.length > 0) {
        const placeId = points[0].placeId;
        const place = this.placeNames.find(p => p.placeId === placeId);
        if (place && place.placeName) {
          return place.placeName;
        }
      }
      return '';
    }
  // Location Dropdown
  locationInput: string = '';
  locations: LocationOption[] = [];
  filteredLocations: LocationOption[] = [];
  isLocationDropdownOpen: boolean = false;
  selectedLocation: LocationOption | null = null;

  // Point Dropdown
  pointInput: string = '';
  points: BoardDropPointVO[] = [];
  filteredPoints: BoardDropPointVO[] = [];
  isPointDropdownOpen: boolean = false;
  selectedPoint: BoardDropPointVO | null = null;

  // Place Name Dropdown
  placeNames: RoutePlaceVO[] = [];
  filteredPlaceNames: RoutePlaceVO[] = [];
  placeInput: string = '';
  isPlaceDropdownOpen: boolean = false;
  selectedPlace: RoutePlaceVO | null = null;

  // UI State
  isShow: boolean = false;
  isCreate: boolean = false;
  isUpdate: boolean = false;
  isDelete: boolean = false;
  isListView: boolean = false;
  isView: boolean = false;
  isEdit: boolean = false;
  showPointValidation: boolean = false;

  // Form and Data
  boardDropForm!: FormGroup;
  dropPoints: BoardDropPointVO[] = [];
  boardDropList: any[] = [];
  filteredBoardDrop: any[] = [];
  searchText: string = '';
  // map of placeId to placeName for quick lookup in list view
  placeNameMap: { [key: number]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private boardDropPointService: BoardDropPointService,
    private routeMapService: RouteMapService,
    private messageDialog: MessageDialogService,
    private router: Router,
    private routePlaceService: RoutePlaceService
  ) { }

  ngOnInit(): void {
    this.routeMapService.getAllRoute().subscribe((data) => {
      this.locations = data.map((item: any) => ({
        routeId: item.routeId,
        routeLocation: item.routeLocation
      }));
      this.filteredLocations = this.locations;
    });
  }

  // --- Location Dropdown Methods ---
  onLocationInput() {
    const val = this.locationInput.toLowerCase();
    this.filteredLocations = this.locations.filter(loc => loc.routeLocation.toLowerCase().includes(val));
    this.isLocationDropdownOpen = this.filteredLocations.length > 0;
  }

  selectLocation(loc: LocationOption) {
    this.selectedLocation = loc;
    this.locationInput = loc.routeLocation;
    this.isLocationDropdownOpen = false;
    this.selectedPoint = null;
    this.pointInput = '';
    this.filteredPoints = [];
    // Load Place Names for selected location
    this.loadPlaceNamesForLocation();
    this.selectedPlace = null;
    this.placeInput = '';
    this.filteredPlaceNames = [];
  }

  closeLocationDropdown() {
    setTimeout(() => this.isLocationDropdownOpen = false, 200);
  }

  // --- Point Dropdown Methods ---
  onPointInput() {
    const val = this.pointInput.toLowerCase();
    this.filteredPoints = this.points.filter(p => p.pointName.toLowerCase().includes(val));
    this.isPointDropdownOpen = this.filteredPoints.length > 0;
  }

  selectPoint(point: BoardDropPointVO) {
    this.selectedPoint = point;
    this.pointInput = point.pointName;
    this.isPointDropdownOpen = false;
    // Optionally, do something when a point is selected
  }

  closePointDropdown() {
    setTimeout(() => this.isPointDropdownOpen = false, 200);
  }

  loadPointsForLocation() {
    if (!this.selectedLocation || !this.selectedPlace) {
      this.points = [];
      this.filteredPoints = [];
      this.dropPoints = [];
      return;
    }
    const placeId = this.selectedPlace && this.selectedPlace.placeId ? this.selectedPlace.placeId : 0;
    this.boardDropPointService.viewAllBoardDropByRouteId(this.selectedLocation.routeId, placeId).subscribe((data) => {
      this.points = data;
      this.filteredPoints = data;
      this.dropPoints = data;
    });
  }

  loadPlaceNamesForLocation() {
    if (!this.selectedLocation) {
      this.placeNames = [];
      this.filteredPlaceNames = [];
      return;
    }
    this.routePlaceService.getAllByRouteId(this.selectedLocation.routeId).subscribe((data: RoutePlaceVO[]) => {
      if (!data || data.length === 0) {
        this.messageDialog.openDialog('Info', 'No places configured for the selected location.', 'Ok')
            .then(() => {
              this.onNavigateHome()
        });
      }
      this.placeNames = data;
      this.filteredPlaceNames = data;
    });
  }

  onPlaceInput() {
    const val = this.placeInput.toLowerCase();
    this.filteredPlaceNames = this.placeNames.filter(p => p.placeName?.toLowerCase().includes(val));
    this.isPlaceDropdownOpen = this.filteredPlaceNames.length > 0;
  }

  selectPlace(place: RoutePlaceVO) {
    this.selectedPlace = place;
    this.placeInput = place.placeName || '';
    this.isPlaceDropdownOpen = false;
    this.loadPointsForLocation();
  }

  closePlaceDropdown() {
    setTimeout(() => this.isPlaceDropdownOpen = false, 200);
  }

  // Update all relevant API calls to use both routeId and placeId
  // Only one onCreate implementation
  onCreate() {
    this.showPointValidation = false;
    if (!this.selectedPlace) {
      this.messageDialog.openDialog('Error', 'Please select a Place Name before creating.', 'Close', 'error');
      return;
    }
    if (!this.selectedLocation) {
      this.messageDialog.openDialog('Error', 'Please select a Location Name', 'Close', 'error');
      return;
    }
    // Check if data already exists for this location and place
    const placeId = this.selectedPlace.placeId ? this.selectedPlace.placeId : 0;
    this.boardDropPointService.viewAllBoardDropByRouteId(this.selectedLocation.routeId, placeId).subscribe((existing) => {
      if (existing && existing.length > 0) {
        this.messageDialog.openDialog('Info', 'Drop points already exist for the selected Location and Place. Please edit or delete them before creating new ones.', 'Ok', 'info');
        this.dropPoints = [];
        this.selectedLocation = null;
        this.selectedPlace = null;
        this.locationInput = '';
        this.placeInput = '';
        this.boardDropForm.reset();
        return;
      }
      // Proceed with create if no existing data
      if (this.dropPoints.length === 0) {
        this.showPointValidation = true;
        this.messageDialog.openDialog('Error', 'Please add at least one drop point', 'Close', 'error');
        return;
      }
      this.boardDropPointService.createAllBoardDropPoint(this.dropPoints).subscribe(
        (resp: any) => {
          let message = 'Board Drop Points Created Successfully!';
          this.messageDialog.openDialog('Info', message, 'Ok', 'info')
            .then(() => {
            this.onLoadBoardDropList(); 
          });
          this.dropPoints = [];
          this.selectedLocation = null;
          this.selectedPlace = null;
          this.locationInput = '';
          this.placeInput = '';
          this.boardDropForm.reset();
        },
        (error) => {
          this.messageDialog.openDialog('Error', 'Failed to create board drop points', 'Close', 'error');
        }
      );
    });
  }

  // Only one onUpdate implementation
  onUpdate() {
    this.showPointValidation = false;
    if (!this.selectedPlace) {
      this.messageDialog.openDialog('Error', 'Please select a Place Name before updating.', 'Close', 'error');
      return;
    }
    if (this.dropPoints.length === 0) {
      this.showPointValidation = true;
      this.messageDialog.openDialog('Error', 'Please add at least one drop point', 'Close', 'error');
      return;
    }
    if (!this.selectedLocation) {
      this.messageDialog.openDialog('Error', 'Please select a Location Name', 'Close', 'error');
      return;
    }
    const username = sessionStorage.getItem('UserInfo.username') || 'admin';
    this.dropPoints.forEach(drop => {
      if (!drop.pointId) {
        drop.createdBy = username;
      }
      drop.updatedBy = username;
    });
    const placeId = this.selectedPlace && this.selectedPlace.placeId ? this.selectedPlace.placeId : 0;
    this.boardDropPointService.updateAllBoardDrop(this.selectedLocation.routeId, placeId, this.dropPoints).subscribe(
      (resp: any) => {
        let message = 'Board Drop Points Updated Successfully!';
        this.messageDialog.openDialog('Info', message, 'Ok')
        .then(() => {
          this.onLoadBoardDropList(); 
        });
      },
      (error) => {
        this.messageDialog.openDialog('Error', 'Failed to update board drop points', 'Close', 'error');
      }
    );
  }

  // Only one onDelete implementation
  onDelete() {
    if (!this.selectedPlace) {
      this.messageDialog.openDialog('Error', 'Please select a Place Name before deleting.', 'Close', 'error');
      return;
    }
    if (!this.selectedLocation) {
      this.messageDialog.openDialog('Error', 'Please select a Location Name', 'Close', 'error');
      return;
    }

    this.messageDialog.openConfirmDialog(
      'Confirm Delete',
      'Are you sure you want to delete all board drop points for the selected Location and Place?',
      'Delete',
      'Cancel'
    ).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      const placeId = this.selectedPlace && this.selectedPlace.placeId ? this.selectedPlace.placeId : 0;
      this.boardDropPointService.deleteAllBoardDropByRouteId(this.selectedLocation!.routeId, placeId).subscribe(
        (resp: string) => {
          this.messageDialog.openDialog('Info', resp, 'Ok', 'info');
          this.dropPoints = [];
          this.selectedLocation = null;
          this.selectedPlace = null;
          this.locationInput = '';
          this.placeInput = '';
          this.boardDropForm.reset();
          this.onLoadBoardDropList();
        }
      );
    });
  }

  // --- Point Name Methods ---
  addDropPoint() {
    if (!this.selectedPlace) {
      this.messageDialog.openDialog('Error', 'Please select a Place Name before adding a drop point.', 'Close', 'error');
      return;
    }
    if (this.pointInput && !this.dropPoints.some(p => p.pointName === this.pointInput)) {
      const newPoint: BoardDropPointVO = {
        routeId: this.selectedLocation ? this.selectedLocation.routeId : 0,
        placeId: this.selectedPlace ? this.selectedPlace.placeId! : 0,
        pointName: this.pointInput,
        sortNumber: this.dropPoints.length + 1
      };
      this.dropPoints.push(newPoint);
      this.pointInput = '';
      this.showPointValidation = false;
    } else {
      this.messageDialog.openDialog('Error', 'Point name already exists.', 'Close', 'error');
    }
  }

  removeDropPoint(index: number) {
    this.dropPoints.splice(index, 1);
    // Recalculate sort numbers
    this.dropPoints.forEach((point, idx) => {
      point.sortNumber = idx + 1;
    });
  }

  // --- Form Initialization ---
  initializeForm() {
    this.boardDropForm = this.formBuilder.group({
      locationId: [''],
      locationName: ['', Validators.required]
    });
  }

  // --- Main Component Methods ---
  onCreateBoardDrop() {
    this.clearFields();
    this.isShow = true;
    this.isCreate = true;
    this.isUpdate = false;
    this.isDelete = false;
    this.isListView = false;
    this.isView = false;
    this.isEdit = true;
    this.dropPoints = [];
    this.selectedLocation = null;
    this.initializeForm();
  }

  clearFields() {    
    this.isShow = false;
    this.locationInput = '';
    this.placeInput = '';
  }

  onSearch() {
    if (!this.selectedLocation) {
      this.messageDialog.openDialog('Error', 'Please select a Location Name', 'Close', 'error');
      return;
    }
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isView = false;
    this.isListView = false;
    this.isEdit = false;
    this.initializeForm();
    this.isShow = true;
    // Load existing board drop points
    this.checkAndLoadExistingPoints();
  }

  checkAndLoadExistingPoints() {
    if (!this.selectedLocation) return;
    if (!this.selectedPlace) {
      this.messageDialog.openDialog('Error', 'Please select a Place Name before loading points.', 'Close', 'error');
      return;
    }
    const placeId = this.selectedPlace.placeId ? this.selectedPlace.placeId : 0;
    this.boardDropPointService.viewAllBoardDropByRouteId(this.selectedLocation.routeId, placeId).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.dropPoints = data;
          this.isCreate = false;
          this.isUpdate = true;
          this.isDelete = true;
          this.isEdit = true;
        } else {
          this.dropPoints = [];
          this.isCreate = true;
          this.isUpdate = false;
          this.isDelete = false;
          this.isEdit = true;
        }
      }
    );
  }

  onLoadBoardDropList() {
    this.clearFields();
    this.isListView = true;
    this.isCreate = false;
    this.isUpdate = false;
    this.isView = false;
    this.isEdit = false;

    this.boardDropPointService.viewAllBoardDrop().subscribe((data) => {
      this.boardDropList = data;
      // Sort data first by routeId then by placeId then by sortNumber
      this.boardDropList.sort((a, b) => {
        if (a.routeId !== b.routeId) {
          return a.routeId - b.routeId;
        }
        if (a.placeId !== b.placeId) {
          return (a.placeId || 0) - (b.placeId || 0);
        }
        return (a.sortNumber || 0) - (b.sortNumber || 0);
      });
      this.filteredBoardDrop = this.boardDropList;

      // preload place names for every routeId present in the list
      const routeIds = Array.from(new Set(this.boardDropList.map(p => p.routeId)));
      this.placeNames = [];
      this.routePlaceService.getAll().subscribe((places: RoutePlaceVO[]) => {
        places.forEach(place => {
            // add to master list if not already present
            if (!this.placeNames.some(p => p.placeId === place.placeId)) {
              this.placeNames.push(place);
            }
            this.placeNameMap[place.placeId!] = place.placeName || '';
          });
      });
    });
  }

  onSearchChange() {
    this.filteredBoardDrop = this.boardDropList.filter(point => {
      const locationName = this.getLocationNameById(point.routeId) || '';
      const placeName = this.getPlaceNameById(point.placeId) || '';
      const text = this.searchText.toLowerCase();
      return (
        locationName.toLowerCase().includes(text) ||
        placeName.toLowerCase().includes(text) ||
        point.pointName.toLowerCase().includes(text)
      );
    });
    // Sort filtered results by routeId, placeId and then sortNumber for consistent grouping
    this.filteredBoardDrop.sort((a, b) => {
      if (a.routeId !== b.routeId) {
        return a.routeId - b.routeId;
      }
      if (a.placeId !== b.placeId) {
        return (a.placeId || 0) - (b.placeId || 0);
      }
      return (a.sortNumber || 0) - (b.sortNumber || 0);
    });
  }

  getLocationNameById(locationId: number): string {
    const loc = this.locations.find(l => l.routeId === locationId);
    return loc ? loc.routeLocation : 'N/A';
  }

  getPointsByRouteId(routeId: number): BoardDropPointVO[] {
    const points = this.boardDropList.filter(p => p.routeId === routeId);
    // Sort points by sortNumber
    return points.sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0));
  }

  getPointsByRouteAndPlace(routeId: number, placeId: number): BoardDropPointVO[] {
    const points = this.boardDropList.filter(p => p.routeId === routeId && p.placeId === placeId);
    return points.sort((a, b) => (a.sortNumber || 0) - (b.sortNumber || 0));
  }

  getRoutePlacePairs(): { routeId: number; placeId: number }[] {
    const pairs = new Set<string>();
    this.filteredBoardDrop.forEach(p => {
      const key = `${p.routeId}_${p.placeId}`;
      pairs.add(key);
    });
    const arr = Array.from(pairs).map(str => {
      const [r, pid] = str.split('_').map(Number);
      return { routeId: r, placeId: pid };
    });
    arr.sort((a, b) => a.routeId - b.routeId || a.placeId - b.placeId);
    return arr;
  }

  getPlaceNameById(placeId: number): string {
    return this.placeNameMap[placeId] || '';
  }


  // open the selected route/place row for editing
  onView(routeId: number, placeId?: number) {
    const loc = this.locations.find(l => l.routeId === routeId);
    if (loc) {
      this.selectedLocation = loc;
      this.locationInput = loc.routeLocation;
    }

    // set selected place if available
    if (placeId) {
      const placeObj = this.placeNames.find(p => p.placeId === placeId);
      if (placeObj) {
        this.selectedPlace = placeObj;
        this.placeInput = placeObj.placeName || '';
      } else {
        // fallback: just set name from map
        this.placeInput = this.placeNameMap[placeId] || '';
        this.selectedPlace = { placeId, placeName: this.placeInput } as RoutePlaceVO;
      }
    }

    // set UI state for editing
    this.isCreate = false;
    this.isUpdate = true;
    this.isDelete = true;
    this.isListView = false;
    this.isView = false;
    this.isEdit = true;
    this.initializeForm();
    this.isShow = true;

    const pid = placeId || (this.selectedPlace?.placeId || 0);
    this.boardDropPointService.viewAllBoardDropByRouteId(routeId, pid).subscribe((data) => {
      this.dropPoints = data;
    });
  }

  onBack() {
    this.boardDropForm.reset();
    this.dropPoints = [];
    this.selectedLocation = null;
    this.locationInput = '';
    this.onLoadBoardDropList();
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }

}
