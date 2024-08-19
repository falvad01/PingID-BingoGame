import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificationChartComponent } from './clasification-chart.component';

describe('ClasificationDonnutChartComponent', () => {
  let component: ClasificationChartComponent;
  let fixture: ComponentFixture<ClasificationChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificationChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClasificationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
