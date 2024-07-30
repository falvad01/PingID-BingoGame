import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicAppPage } from './ionic-app.page';

describe('IonicAppPage', () => {
  let component: IonicAppPage;
  let fixture: ComponentFixture<IonicAppPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IonicAppPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
