import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { firstNumberGuard } from './first-number.guard';

describe('firstNumberGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => firstNumberGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
