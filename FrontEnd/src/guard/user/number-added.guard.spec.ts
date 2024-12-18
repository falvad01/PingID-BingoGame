import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { numberAddedGuard } from './number-added.guard';

describe('numberAddedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => numberAddedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
