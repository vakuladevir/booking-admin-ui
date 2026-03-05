import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetMaintainComponent } from './fleet-maintain.component';

describe('FleetMaintainComponent', () => {
  let component: FleetMaintainComponent;
  let fixture: ComponentFixture<FleetMaintainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FleetMaintainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetMaintainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
