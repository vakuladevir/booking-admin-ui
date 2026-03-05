import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ParnterMasterService } from 'src/app/services/partnerMaster.service';
import { ParnterBankService } from 'src/app/services/partnerBank.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { HttpClient } from '@angular/common/http';
import { BudgetPlannerService } from 'src/app/services/budgetPlanner.service';
import { DriverInfoService } from 'src/app/services/driverInfo.service';
import { FleetService } from 'src/app/services/fleet.service';
import { RouteMapService } from 'src/app/services/routeMap.service';
import { GkItemCategoryService } from 'src/app/services/gkItemCategory.service';
import { GalleyKitchenService } from 'src/app/services/galleyKitchen.service';
import { TripPlannerService } from 'src/app/services/tripPlanner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  // For column filter UI
  showFilter: { [key: string]: boolean } = {};
  columnFilters: { [key: string]: string } = {};
  filteredReportData: any[] = [];

  reportTypes = [
    { label: 'Partner', value: 'partner' },
    { label: 'Partner Bank', value: 'partnerBank' },
    { label: 'Vehicle', value: 'vehicle' },
    { label: 'Vehicle Type', value: 'vehicleType' },
    { label: 'Routes', value: 'routes' },
    { label: 'Galley Kitchen', value: 'galleyKitchen' },
    { label: 'Trip Planner', value: 'tripPlanner' },
    { label: 'Item Category', value: 'itemCategory' },
    { label: 'Driver Master', value: 'driver' },
    { label: 'Fleet Maintenance', value: 'fleet' },
    { label: 'Route Map', value: 'routeMap' },
    { label: 'Budget', value: 'budget' }
  ];
  selectedReportType: string = '';
  searchParams: any = {};
  reportData: any[] = [];
  columns: string[] = [];

  reportSearched: boolean = false;

  loading: boolean = false;
  errorMsg: string = '';

  constructor(
    private partnerService: ParnterMasterService,
    private partnerBankService: ParnterBankService,
    private vehicleService: VehicleService,
    private budgetService: BudgetPlannerService,
    private driverInfoService: DriverInfoService,
    private fleetService: FleetService,
    private routeMapService: RouteMapService,
    private gkItemCategoryService: GkItemCategoryService,
    private galleyKitchenService: GalleyKitchenService,
    private tripPlannerService: TripPlannerService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filteredReportData = this.reportData;
  }

  onReportTypeChange() {
    this.searchParams = {};
    this.reportData = [];
    this.filteredReportData = [];
    this.columns = [];
    this.showFilter = {};
    this.columnFilters = {};
    this.reportSearched = false; // Reset the flag when report type changes
  }

  onSearch() {
    this.loading = true;
    this.errorMsg = '';
    this.reportData = [];
    this.filteredReportData = [];
    this.columns = [];
    this.showFilter = {};
    this.columnFilters = {};
    this.reportSearched = true; // Set the flag to true when a search is performed
  if (this.selectedReportType === 'partner') {
    this.partnerService.getAllPartner().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: err => {
        this.errorMsg = 'Failed to load partner data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'partnerBank') {
    this.partnerBankService.getAllBankDetails().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: err => {
        this.errorMsg = 'Failed to load partner bank data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'routes') {
    this.routeMapService.getAllRoute().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: err => {
        this.errorMsg = 'Failed to load routes data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'galleyKitchen') {
    this.galleyKitchenService.getAllItems().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMsg = 'Failed to load galley kitchen data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'tripPlanner') {
    this.tripPlannerService.getAllTrips().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMsg = 'Failed to load trip planner data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'itemCategory') {
    this.gkItemCategoryService.getAllCategory().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMsg = 'Failed to load item category data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'vehicleType') {
    this.vehicleService.getAllVTypes().subscribe({
      next: (data: any[]) => {
        this.reportData = data || [];
        this.filteredReportData = this.reportData;
        this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
        this.loading = false;
      },
      error: err => {
        this.errorMsg = 'Failed to load vehicle type data.';
        this.loading = false;
      }
    });
  } else if (this.selectedReportType === 'vehicle') {
      this.vehicleService.getAllVehicle().subscribe({
        next: (data: any[]) => {
          this.reportData = data || [];
          this.filteredReportData = this.reportData;
          this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
          this.loading = false;
        },
        error: err => {
          this.errorMsg = 'Failed to load vehicle data.';
          this.loading = false;
        }
      });
    } 
    // else if (this.selectedReportType === 'partnerBank') {
    //   this.partnerService.getAllPartnerBank().subscribe({
    //     next: (data: any[]) => {
    //       this.reportData = data || [];
    //       this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
    //       this.loading = false;
    //     },
    //     error: err => {
    //       this.errorMsg = 'Failed to load partner bank data.';
    //       this.loading = false;
    //     }
    //   });
    // } 
    else if (this.selectedReportType === 'driver') {
      this.driverInfoService.getAllDrivers().subscribe({
        next: (data: any[]) => {
          this.reportData = data || [];
          this.filteredReportData = this.reportData;
          this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
          this.loading = false;
        },
        error: err => {
          this.errorMsg = 'Failed to load driver data.';
          this.loading = false;
        }
      });
    } else if (this.selectedReportType === 'fleet') {
      this.fleetService.getAllFleet().subscribe({
        next: (data: any[]) => {
          this.reportData = data || [];
          this.filteredReportData = this.reportData;
          this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
          this.loading = false;
        },
        error: err => {
          this.errorMsg = 'Failed to load fleet maintenance data.';
          this.loading = false;
        }
      });
    } else if (this.selectedReportType === 'routeMap') {
      this.routeMapService.getAllRoutes().subscribe({
        next: (data: any[]) => {
          this.reportData = data || [];
          this.filteredReportData = this.reportData;
          this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
          this.loading = false;
        },
        error: err => {
          this.errorMsg = 'Failed to load route map data.';
          this.loading = false;
        }
      });
    } else if (this.selectedReportType === 'budget') {
      // For demo, get all unique BudgetGenIds and fetch all versions for each
      this.budgetService.getAllUniqueBudgetGenIds().subscribe({
        next: (ids: string[]) => {
          if (!ids || ids.length === 0) {
            this.loading = false;
            return;
          }
          let allBudgets: any[] = [];
          let completed = 0;
          ids.forEach(id => {
            this.budgetService.getAllVersionsByBudgetGenId(id).subscribe({
              next: (budgets: any[]) => {
                allBudgets = allBudgets.concat(budgets);
                completed++;
                if (completed === ids.length) {
                  this.reportData = allBudgets;
                  this.filteredReportData = this.reportData;
                  this.columns = this.reportData.length > 0 ? Object.keys(this.reportData[0]) : [];
                  this.loading = false;
                }
              }
            });
          });
        },
        error: () => {
          this.errorMsg = 'Failed to load budget data.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  // Called when a column filter changes
  onColumnFilterChange(col: string) {
    // Filter reportData based on all columnFilters
    this.filteredReportData = this.reportData.filter(row => {
      return Object.keys(this.columnFilters).every(key => {
        const filterVal = this.columnFilters[key];
        if (!filterVal) return true;
        const cellVal = row[key] != null ? String(row[key]) : '';
        return cellVal.toLowerCase().includes(filterVal.toLowerCase());
      });
    });
  }

  downloadExcel() {
    if (!this.reportData || this.reportData.length === 0) return;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${this.selectedReportType || 'report'}_report.xlsx`);
  }

  onNavigateHome() {
    this.router.navigate(['/home']);
  }
}
