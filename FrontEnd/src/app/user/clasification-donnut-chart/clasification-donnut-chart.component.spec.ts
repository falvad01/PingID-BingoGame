import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificationDonnutChartComponent } from './clasification-donnut-chart.component';

describe('ClasificationDonnutChartComponent', () => {
  let component: ClasificationDonnutChartComponent;
  let fixture: ComponentFixture<ClasificationDonnutChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClasificationDonnutChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClasificationDonnutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
