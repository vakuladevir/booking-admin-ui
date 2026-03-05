import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponentComponent } from './login/login-component/login-component.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { PartnerMasterComponent } from './home/partner-master/partner-master.component';
import { MessageDialogComponent } from './shared/message-dialog/message-dialog.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PartnerBankComponent } from './home/partner-bank/partner-bank.component';
import { VehicleMasterComponent } from './home/vehicle-master/vehicle-master.component';
import { DriverInfoComponent } from './home/driver-info/driver-info.component';
import { FleetMaintainComponent } from './home/fleet-maintain/fleet-maintain.component';
import { RouteMapComponent } from './home/route-map/route-map.component';
import { TripPlannerComponent } from './home/trip-planner/trip-planner.component';
import { BusRouteConfiguratorComponent } from './home/trip-planner/bus-route-configurator/bus-route-configurator.component';
import { BudgetPlannerComponent } from './home/budget-planner/budget-planner.component';
import { ReportsComponent } from './home/reports/reports.component';
import { GalleyKitchenComponent } from './home/galley-kitchen/galley-kitchen.component';
import { BoardDropComponent } from './home/board-drop/board-drop.component';

import { CalendarViewComponent } from './home/trip-planner/calendar-view/calendar-view.component';
import { CalendarMonthPipe, CalendarWeekPipe, CalendarDayPipe } from './home/trip-planner/calendar-view/calendar-view.pipe';
import { DateToObjPipe } from './home/trip-planner/calendar-view/date-to-obj.pipe';
import { TripReportsComponent } from './home/trip-planner/trip-reports/trip-reports.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';

import { NgChartsModule } from 'ng2-charts';
import { TitlecaseWithSpacesPipe } from './shared/titlecase-with-spaces.pipe';

import { RoutePlacesComponent } from './home/route-places/route-places.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponentComponent,
    HomePageComponent,
    PartnerMasterComponent,
    MessageDialogComponent,
    PartnerBankComponent,
    VehicleMasterComponent,
    DriverInfoComponent,
    FleetMaintainComponent,
    RouteMapComponent,
    TripPlannerComponent,
    BudgetPlannerComponent,
    ReportsComponent,
    GalleyKitchenComponent,
    BoardDropComponent,
    CalendarViewComponent,
    CalendarMonthPipe,
    CalendarWeekPipe,
    CalendarDayPipe,
    DateToObjPipe,
    TripReportsComponent,
  DashboardComponent,
  TitlecaseWithSpacesPipe,
  BusRouteConfiguratorComponent
    ,RoutePlacesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    NgChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
