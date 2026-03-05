import { Component, OnInit } from '@angular/core';
import { TripPlannerService } from 'src/app/services/tripPlanner.service';
import { DriverInfoService } from 'src/app/services/driverInfo.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { FleetService } from 'src/app/services/fleet.service';
import { TripPlannerVO } from 'src/app/model/tripPlannerVO.model';
import { DriverInfoVO } from 'src/app/model/driverInfoVO.model';
import { VehicleDetailsVO } from 'src/app/model/vehicleDetailsVO.model';
import { PartnerMasterVO } from 'src/app/model/partnerMasterVO.model';
import { FleetMaintenanceVO } from 'src/app/model/fleetMaintenanceVO.model';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  trips: TripPlannerVO[] = [];
  drivers: DriverInfoVO[] = [];
  vehicles: VehicleDetailsVO[] = [];
  partners: PartnerMasterVO[] = [];
  fleets: FleetMaintenanceVO[] = [];

  isLoading = true;
  errorMsg = '';

  // Summary stats
  totalTrips = 0;
  onewayTrips = 0;
  roundtripTrips = 0;
  ltpTrips = 0;
  completedTrips = 0;
  pendingTrips = 0;
  cancelledTrips = 0;
  totalDrivers = 0;
  totalVehicles = 0;
  totalPartners = 0;
  fleetUtilization = 0;
  avgTripDuration = 0;
  tripsToday = 0;
  tripsThisWeek = 0;
  topDrivers: { name: string, count: number }[] = [];
  topPartners: { name: string, count: number }[] = [];
  mostFrequentRoute = '';

  // Chart data and options for ng2-charts v4.x
  tripTrendsChartData: any = { labels: [], datasets: [{ data: [], label: 'Trips' }] };
  tripTrendsChartType: ChartType = 'line';
  tripTrendsOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  tripTypeChartData: any = { labels: ['Oneway', 'Roundtrip', 'LTP'], datasets: [{ data: [], label: 'Trip Types' }] };
  tripTypeChartType: ChartType = 'doughnut';
  tripTypeOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  tripStatusChartData: any = { labels: ['Completed', 'Pending', 'Cancelled'], datasets: [{ data: [], label: 'Trip Status' }] };
  tripStatusChartType: ChartType = 'pie';
  tripStatusOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  // Fleet Usage Bar Chart (trips per vehicle)
  fleetUsageChartData: any = { labels: [], datasets: [{ data: [], label: 'Trips per Vehicle' }] };
  fleetUsageChartType: ChartType = 'bar';
  fleetUsageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    indexAxis: 'x' // vertical bars
  };

  // Driver Performance Bar Chart (trips per driver)
  driverPerformanceChartData: any = { labels: [], datasets: [{ data: [], label: 'Trips per Driver' }] };
  driverPerformanceChartType: ChartType = 'bar';
  driverPerformanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    indexAxis: 'x' // vertical bars
  };

  // Partner Contribution Pie Chart (trips per partner)
  partnerContributionChartData: any = { labels: [], datasets: [{ data: [], label: 'Trips per Partner' }] };
  partnerContributionChartType: ChartType = 'pie';
  partnerContributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  // Route Popularity Horizontal Bar Chart (top routes)
  routePopularityChartData: any = { labels: [], datasets: [{ data: [], label: 'Trips per Route' }] };
  routePopularityChartType: ChartType = 'bar';
  routePopularityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    indexAxis: 'y' // horizontal bars
  };

  // Location Heatmap Table (trips per location)
  locationHeatmap: { location: string, started: number, ended: number }[] = [];

  constructor(
    private tripService: TripPlannerService,
    private driverService: DriverInfoService,
    private vehicleService: VehicleService,
    private partnerService: ParnterMasterService,
    private fleetService: FleetService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    this.errorMsg = '';
    Promise.all([
      this.tripService.getAllTrips().toPromise(),
      this.driverService.getAllDrivers().toPromise(),
      this.vehicleService.getAllVehicleCodes ? this.vehicleService.getAllVehicleCodes().toPromise() : Promise.resolve([]),
      this.partnerService.getAllBpNo ? this.partnerService.getAllBpNo().toPromise() : Promise.resolve([]),
      this.fleetService.getAllFleet().toPromise()
    ]).then(([trips, drivers, vehicles, partners, fleets]) => {
      this.trips = trips || [];
      this.drivers = drivers || [];
      this.vehicles = vehicles || [];
      this.partners = partners || [];
      this.fleets = fleets || [];
      this.calculateStats();
      this.isLoading = false;
    }).catch(err => {
      this.errorMsg = 'Failed to load dashboard data.';
      this.isLoading = false;
    });
  }

  calculateStats() {
    // Total trips
    this.totalTrips = this.trips.length;
    this.onewayTrips = this.trips.filter(t => t.tripType === 'oneway').length;
    this.roundtripTrips = this.trips.filter(t => t.tripType === 'roundtrip').length;
    this.ltpTrips = this.trips.filter(t => t.isLtp).length;
    this.completedTrips = this.trips.filter(t => t.tripStatus === 'Completed').length;
    this.pendingTrips = this.trips.filter(t => t.tripStatus === 'Planned' || t.tripStatus === 'Pending').length;
    this.cancelledTrips = this.trips.filter(t => t.tripStatus === 'Cancelled').length;
    this.totalDrivers = this.drivers.length;
    this.totalVehicles = this.vehicles.length;
    this.totalPartners = this.partners.length;
    // Fleet utilization: % of vehicles in use (with at least one trip)
    const vehiclesInUse = new Set(this.trips.map(t => t.vehicleId));
    this.fleetUtilization = this.totalVehicles ? Math.round((vehiclesInUse.size / this.totalVehicles) * 100) : 0;
    // Average trip duration (in hours)
    const durations = this.trips.map(t => {
      const start = new Date(t.srcStartDate).getTime();
      const end = new Date(t.desEndDate).getTime();
      return (end - start) / (1000 * 60 * 60);
    }).filter(d => d > 0);
    this.avgTripDuration = durations.length ? +(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0;
    // Trips today/this week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    this.tripsToday = this.trips.filter(t => {
      const d = new Date(t.srcStartDate);
      return d.toDateString() === today.toDateString();
    }).length;
    this.tripsThisWeek = this.trips.filter(t => {
      const d = new Date(t.srcStartDate);
      return d >= startOfWeek && d <= today;
    }).length;
    // Top 3 drivers by trip count
    const driverCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      if (t.driverId) driverCounts[t.driverId] = (driverCounts[t.driverId] || 0) + 1;
    });
    this.topDrivers = Object.entries(driverCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => {
        const driver = this.drivers.find(d => d.driverId == +id);
        return { name: driver ? driver.name : 'Unknown', count };
      });
    // Top 3 partners by trip volume (map trip.vehicleId -> vehicle.partnerId, then aggregate)
    const partnerCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const vehicle = this.vehicles.find(v => v.vehicleId == t.vehicleId);
      const partnerId = vehicle && vehicle.partnerId ? vehicle.partnerId : null;
      if (partnerId) partnerCounts[partnerId] = (partnerCounts[partnerId] || 0) + 1;
    });
    this.topPartners = Object.entries(partnerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([partnerId, count]) => {
        const partner = this.partners.find(p => p.partnerId == +partnerId);
        return { name: partner ? partner.partnerName || partnerId : partnerId, count };
      });
    // Most frequent route
    const routeCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const route = `${t.fromLoc} → ${t.toLoc}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const topRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0];
    this.mostFrequentRoute = topRoute ? topRoute[0] : '-';
    // Chart: Trips over time (by day, last 14 days)
    const dateCounts: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateCounts[key] = 0;
    }
    this.trips.forEach(t => {
      const d = new Date(t.srcStartDate).toISOString().split('T')[0];
      if (dateCounts[d] !== undefined) dateCounts[d]++;
    });
    this.tripTrendsChartData = {
      labels: Object.keys(dateCounts),
      datasets: [{ data: Object.values(dateCounts), label: 'Trips' }]
    };
    // Chart: Trip type distribution
    this.tripTypeChartData = {
      labels: ['Oneway', 'Roundtrip', 'LTP'],
      datasets: [{ data: [this.onewayTrips, this.roundtripTrips, this.ltpTrips], label: 'Trip Types' }]
    };
    // Chart: Trip status breakdown
    this.tripStatusChartData = {
      labels: ['Completed', 'Pending', 'Cancelled'],
      datasets: [{ data: [this.completedTrips, this.pendingTrips, this.cancelledTrips], label: 'Trip Status' }]
    };
    // Fleet Usage: trips per vehicle
    const vehicleTripCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const code = t.vehicleCode || 'Unknown';
      vehicleTripCounts[code] = (vehicleTripCounts[code] || 0) + 1;
    });
    this.fleetUsageChartData = {
      labels: Object.keys(vehicleTripCounts),
      datasets: [{ data: Object.values(vehicleTripCounts), label: 'Trips per Vehicle' }]
    };
    // Driver Performance: trips per driver
    const driverTripCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const driver = this.drivers.find(d => d.driverId === t.driverId);
      const name = driver ? driver.name : 'Unknown';
      driverTripCounts[name] = (driverTripCounts[name] || 0) + 1;
    });
    this.driverPerformanceChartData = {
      labels: Object.keys(driverTripCounts),
      datasets: [{ data: Object.values(driverTripCounts), label: 'Trips per Driver' }]
    };
    // Partner Contribution: trips per partner
    const partnerTripCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const vehicle = this.vehicles.find(v => v.vehicleId == t.vehicleId);
      let name = 'Unknown';
      if (vehicle && vehicle.partnerId) {
        const partner = this.partners.find(p => p.partnerId == vehicle.partnerId);
        name = partner && partner.partnerName ? partner.partnerName : `Partner ${vehicle.partnerId}`;
      }
      partnerTripCounts[name] = (partnerTripCounts[name] || 0) + 1;
    });
    this.partnerContributionChartData = {
      labels: Object.keys(partnerTripCounts),
      datasets: [{ data: Object.values(partnerTripCounts), label: 'Trips per Partner' }]
    };
    // Route Popularity: top routes (from-to pairs)
    const routePopularityCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      const route = `${t.fromLoc} → ${t.toLoc}`;
      routePopularityCounts[route] = (routePopularityCounts[route] || 0) + 1;
    });
    const sortedRoutes = Object.entries(routePopularityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    this.routePopularityChartData = {
      labels: sortedRoutes.map(([route]) => route),
      datasets: [{ data: sortedRoutes.map(([, count]) => count), label: 'Trips per Route' }]
    };
    // Location Heatmap: trips started and ended per location
    const startedCounts: { [key: string]: number } = {};
    const endedCounts: { [key: string]: number } = {};
    this.trips.forEach(t => {
      if (t.fromLoc) startedCounts[t.fromLoc] = (startedCounts[t.fromLoc] || 0) + 1;
      if (t.toLoc) endedCounts[t.toLoc] = (endedCounts[t.toLoc] || 0) + 1;
    });
    const allLocations = Array.from(new Set([
      ...Object.keys(startedCounts),
      ...Object.keys(endedCounts)
    ]));

    this.locationHeatmap = allLocations
      .map(location => ({
        location,
        started: startedCounts[location] || 0,
        ended: endedCounts[location] || 0
      }))
      .sort((a, b) => (b.started + b.ended) - (a.started + a.ended));
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}
