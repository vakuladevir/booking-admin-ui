import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerMasterComponent } from './partner-master.component';

describe('PartnerMasterComponent', () => {
  let component: PartnerMasterComponent;
  let fixture: ComponentFixture<PartnerMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
