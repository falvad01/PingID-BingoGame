import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMainPage } from './admin-main.page';

describe('AdminMainPage', () => {
  let component: AdminMainPage;
  let fixture: ComponentFixture<AdminMainPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMainPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
