import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainUserPage } from './main-user.page';

describe('AdminMainPage', () => {
  let component: MainUserPage;
  let fixture: ComponentFixture<MainUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
