import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface StopMap {
  stopLocation: string;
  sortNumber: number;
  routeId: number;
  timing?: string;
  boardDropPoints?: BoardDropPoint[];
  selectedPoints?: SelectedPoint[];
}

interface BoardDropPoint {
  pointId: number;
  pointName: string;
  fullAddress?: string;
}

interface SelectedPoint {
  pointId: number;
  pointName: string;
  type: 'board' | 'drop' | 'both';
  timing: string;
}

@Component({
  selector: 'app-bus-route-configurator',
  templateUrl: './bus-route-configurator.component.html',
  styleUrls: ['./bus-route-configurator.component.scss']
})
export class BusRouteConfiguratorComponent implements OnInit {
  @Input() routeCode: string = '';
  @Output() configApplied = new EventEmitter<any>();
  stops: StopMap[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.routeCode) {
      this.fetchRouteMap();
    }
  }

  fetchRouteMap() {
    this.loading = true;
    this.http.get<any>(`http://localhost:5000/bookingAdmin/routeMap/getByRouteCode/${this.routeCode}`)
      .subscribe({
        next: (data) => {
          this.stops = (data.stopMapList || []).sort((a: any, b: any) => a.sortNumber - b.sortNumber);
          this.stops.forEach(stop => {
            this.fetchBoardDropPoints(stop);
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load route map.';
          this.loading = false;
        }
      });
  }

  fetchBoardDropPoints(stop: StopMap) {
    this.http.get<any[]>(`http://localhost:5000/bookingAdmin/boardDropPoint/viewAllBoardDrop/${stop.routeId}`)
      .subscribe({
        next: (points) => {
          stop.boardDropPoints = points || [];
        },
        error: () => {
          stop.boardDropPoints = [];
        }
      });
  }

  addSelectedPoint(stop: StopMap, point: BoardDropPoint, type: string, timing: string) {
    const validType = (['board', 'drop', 'both'].includes(type) ? type : 'board') as 'board' | 'drop' | 'both';
    if (!stop.selectedPoints) stop.selectedPoints = [];
    stop.selectedPoints.push({ pointId: point.pointId, pointName: point.pointName, type: validType, timing });
  }

  removeSelectedPoint(stop: StopMap, idx: number) {
    if (stop.selectedPoints) stop.selectedPoints.splice(idx, 1);
  }

  applyConfig() {
    this.configApplied.emit(this.stops);
  }
}
