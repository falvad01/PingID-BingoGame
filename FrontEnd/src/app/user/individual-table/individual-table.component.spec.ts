import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualTableComponent } from './individual-table.component';

describe('IndividualTableComponent', () => {
  let component: IndividualTableComponent;
  let fixture: ComponentFixture<IndividualTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualTableComponent]
    });
    fixture = TestBed.createComponent(IndividualTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
