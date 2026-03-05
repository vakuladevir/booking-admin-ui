import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDropComponent } from './board-drop.component';

describe('BoardDropComponent', () => {
  let component: BoardDropComponent;
  let fixture: ComponentFixture<BoardDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardDropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
