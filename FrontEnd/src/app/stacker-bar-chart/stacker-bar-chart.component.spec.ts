import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackerBarChartComponent } from './stacker-bar-chart.component';

describe('StackerBarChartComponent', () => {
  let component: StackerBarChartComponent;
  let fixture: ComponentFixture<StackerBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackerBarChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StackerBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
