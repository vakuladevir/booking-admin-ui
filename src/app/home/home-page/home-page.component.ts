import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  tiles = [
    { name: 'Partner Master', route: 'partner-master', image: 'assets/partner-master.png' },
    { name: 'Partner Bank', route: 'partner-bank', image: 'assets/partner-bank.png' },
    { name: 'Vehicle Master', route: 'vehicle-master', image: 'assets/trip-planning.png' },
    { name: 'Driver Master', route: 'driver-info', image: 'assets/partner-master.png' },
    { name: 'Fleet Maintenance', route: 'fleet-maintain', image: 'assets/partner-bank.png' },
    { name: 'Route Places', route: 'route-places', image: 'assets/trip-planning.png' },
    { name: 'Board Drop Points', route: 'board-drop', image: 'assets/trip-planning.png' },
    { name: 'Route Map', route: 'route-map', image: 'assets/trip-planning.png' },
    { name: 'Budget Planner', route: 'budget-planner', image: 'assets/trip-planning.png' },
    { name: 'Galley Kitchen', route: 'galley-kitchen', image: 'assets/trip-planning.png' },
    { name: 'Trip Planner', route: 'trip-plan', image: 'assets/partner-master.png' },
    { name: 'Reports', route: 'reports', image: 'assets/trip-planning.png' },
    { name: 'Dashboard', route: 'dashboard', image: 'assets/partner-bank.png' }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit(): void {
  }

}
