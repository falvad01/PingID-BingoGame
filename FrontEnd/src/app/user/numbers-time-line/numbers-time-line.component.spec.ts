import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersTimeLineComponent } from './numbers-time-line.component';

describe('NumbersTimeLineComponent', () => {
  let component: NumbersTimeLineComponent;
  let fixture: ComponentFixture<NumbersTimeLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumbersTimeLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NumbersTimeLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
