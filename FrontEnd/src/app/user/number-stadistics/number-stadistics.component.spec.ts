import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberStadisticsComponent } from './number-stadistics.component';

describe('NumberStadisticsComponent', () => {
  let component: NumberStadisticsComponent;
  let fixture: ComponentFixture<NumberStadisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NumberStadisticsComponent]
    });
    fixture = TestBed.createComponent(NumberStadisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
