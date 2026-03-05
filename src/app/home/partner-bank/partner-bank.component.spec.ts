import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerBankComponent } from './partner-bank.component';

describe('PartnerBankComponent', () => {
  let component: PartnerBankComponent;
  let fixture: ComponentFixture<PartnerBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerBankComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
