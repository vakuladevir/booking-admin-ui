import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleyKitchenComponent } from './galley-kitchen.component';

describe('GalleyKitchenComponent', () => {
  let component: GalleyKitchenComponent;
  let fixture: ComponentFixture<GalleyKitchenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleyKitchenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleyKitchenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
