import { TestBed } from '@angular/core/testing';

import { PullToRefreshService } from './pull-to-refresh.service';

describe('PullToRefreshService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PullToRefreshService = TestBed.get(PullToRefreshService);
    expect(service).toBeTruthy();
  });
});
