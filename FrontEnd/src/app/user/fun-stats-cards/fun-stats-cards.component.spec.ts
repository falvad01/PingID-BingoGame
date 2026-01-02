import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunStatsCardsComponent } from './fun-stats-cards.component';

describe('FunStatsCardsComponent', () => {
  let component: FunStatsCardsComponent;
  let fixture: ComponentFixture<FunStatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunStatsCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FunStatsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
