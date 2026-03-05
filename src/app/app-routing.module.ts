import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './login/login-component/login-component.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { PartnerMasterComponent } from './home/partner-master/partner-master.component';
import { PartnerBankComponent } from './home/partner-bank/partner-bank.component';
import { VehicleMasterComponent } from './home/vehicle-master/vehicle-master.component';
import { DriverInfoComponent } from './home/driver-info/driver-info.component';
import { FleetMaintainComponent } from './home/fleet-maintain/fleet-maintain.component';
import { RouteMapComponent } from './home/route-map/route-map.component';
import { TripPlannerComponent } from './home/trip-planner/trip-planner.component';
import { BudgetPlannerComponent } from './home/budget-planner/budget-planner.component';
import { ReportsComponent } from './home/reports/reports.component';
import { GalleyKitchenComponent } from './home/galley-kitchen/galley-kitchen.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { BoardDropComponent } from './home/board-drop/board-drop.component';
import { RoutePlacesComponent } from './home/route-places/route-places.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'Login',
    pathMatch: 'full',
  },
  {
    path: 'Login',
    component: LoginComponentComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'home',
    component: HomePageComponent
  },
  {
    path: 'partner-master',
    component: PartnerMasterComponent
  },
  {
    path: 'partner-bank',
    component: PartnerBankComponent
  },
  {
    path: 'vehicle-master',
    component: VehicleMasterComponent
  },
  {
    path: 'driver-info',
    component: DriverInfoComponent
  },
  {
    path: 'fleet-maintain',
    component: FleetMaintainComponent
  },
  {
    path: 'route-map',
    component: RouteMapComponent
  },
  {
    path: 'budget-planner',
    component: BudgetPlannerComponent
  },
  {
    path: 'galley-kitchen',
    component: GalleyKitchenComponent
  },
  {
    path: 'trip-plan',
    component: TripPlannerComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'board-drop',
    component: BoardDropComponent
  }

    ,{
      path: 'route-places',
      component: RoutePlacesComponent,
      data: {
        title: 'Route Places'
      }
    }

  
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
