

import { Component, OnInit } from '@angular/core';
import { RoutePlaceService } from '../../services/routePlace.service';
import { RoutePlaceVO } from '../../model/routePlaceVO.model';
import { RoutesVO } from '../../model/routesVO.model';
import { RouteMapService } from '../../services/routeMap.service';
import { GeneralRespVO } from '../../model/generalRespVO.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-route-places',
  templateUrl: './route-places.component.html',
  styleUrls: ['./route-places.component.scss']
})
export class RoutePlacesComponent implements OnInit {
    // Place Name Dropdown
    public placeInput: string = '';
    public filteredPlaceNames: RoutePlaceVO[] = [];
    public isPlaceDropdownOpen: boolean = false;
    public selectedPlace: RoutePlaceVO | null = null;
  locationInput = '';
  locations: RoutesVO[] = [];
  filteredLocations: RoutesVO[] = [];
  isLocationDropdownOpen = false;
  selectedLocation: RoutesVO | null = null;

  places: RoutePlaceVO[] = [];
  addMode = false;
  newPlaceName = '';
  newPlaceNameShort = '';

  editPlaceId: number | null = null;
  editPlaceName = '';
  editPlaceNameShort = '';

  constructor(
    private routePlaceService: RoutePlaceService,
    private routeMapService: RouteMapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.routeMapService.getAllRoute().subscribe((data: RoutesVO[]) => {
      this.locations = data;
      this.filteredLocations = data;
    });
  }

  onLocationInput() {
    const val = this.locationInput.toLowerCase();
    this.filteredLocations = this.locations.filter(loc => loc.routeLocation?.toLowerCase().includes(val));
    this.isLocationDropdownOpen = this.filteredLocations.length > 0;
  }

  selectLocation(loc: RoutesVO) {
    this.selectedLocation = loc;
    this.locationInput = loc.routeLocation || '';
    this.isLocationDropdownOpen = false;
    this.loadPlacesForLocation();
    this.addMode = false;
    this.editPlaceId = null;
    this.selectedPlace = null;
    this.placeInput = '';
    this.filteredPlaceNames = [];
    }
    onPlaceInput() {
      const val = this.placeInput.toLowerCase();
      this.filteredPlaceNames = this.places.filter(p => p.placeName?.toLowerCase().includes(val));
      this.isPlaceDropdownOpen = this.filteredPlaceNames.length > 0;
    }

    selectPlace(place: RoutePlaceVO) {
      this.selectedPlace = place;
      this.placeInput = place.placeName || '';
      this.isPlaceDropdownOpen = false;
      // Optionally, do something when a place is selected

    }

    closePlaceDropdown() {
      setTimeout(() => this.isPlaceDropdownOpen = false, 200);
    }

    closeLocationDropdown() {
      setTimeout(() => this.isLocationDropdownOpen = false, 200);
    }

    loadPlacesForLocation() {
      if (!this.selectedLocation?.routeId) {
        this.places = [];
        return;
      }
      this.routePlaceService.getAllByRouteId(this.selectedLocation.routeId).subscribe((data: RoutePlaceVO[]) => {
        this.places = data;
        this.filteredPlaceNames = data;
      });
    }

    onShowAdd() {
      this.addMode = true;
      this.newPlaceName = '';
      this.newPlaceNameShort = '';
      this.editPlaceId = null;
    }

    onCancelAdd() {
      this.addMode = false;
      this.newPlaceName = '';
      this.newPlaceNameShort = '';
    }

    onAddPlace() {
      if (!this.selectedLocation?.routeId || !this.newPlaceName) return;
      const newPlace: RoutePlaceVO = {
        routeId: this.selectedLocation.routeId,
        placeName: this.newPlaceName,
        placeNameShort: this.newPlaceNameShort
      };
      this.routePlaceService.create(newPlace).subscribe(() => {
        this.loadPlacesForLocation();
        this.onCancelAdd();
      });
    }

    onEditPlace(place: RoutePlaceVO) {
      this.editPlaceId = place.placeId!;
      this.editPlaceName = place.placeName || '';
      this.editPlaceNameShort = place.placeNameShort || '';
      this.addMode = false;
    }

    onCancelEdit() {
      this.editPlaceId = null;
      this.editPlaceName = '';
      this.editPlaceNameShort = '';
    }

    onSaveEditPlace(place: RoutePlaceVO) {
      if (!this.editPlaceName) return;
      const updated: RoutePlaceVO = {
        ...place,
        placeName: this.editPlaceName,
        placeNameShort: this.editPlaceNameShort
      };
      this.routePlaceService.update(place.placeId!, updated).subscribe(() => {
        this.loadPlacesForLocation();
        this.onCancelEdit();
      });
    }

    onDeletePlace(place: RoutePlaceVO) {
      if (!place.placeId) return;
      const updatedBy = sessionStorage.getItem('UserInfo.username') || '';
      this.routePlaceService.softDelete(place.placeId, updatedBy).subscribe(() => {
        this.loadPlacesForLocation();
      });
    }

    onDeleteAllPlaces() {
      if (!this.selectedLocation?.routeId) return;
      const updatedBy = sessionStorage.getItem('UserInfo.username') || '';
      this.routePlaceService.softDeleteAllByRouteId(this.selectedLocation.routeId, updatedBy).subscribe(() => {
        this.loadPlacesForLocation();
      });
    }

    onNavigateHome() {
      this.router.navigate(['/home']);
    }
  }
