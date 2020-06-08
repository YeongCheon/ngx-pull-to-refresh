import { TestBed } from '@angular/core/testing';

import { NgxPullToRefreshService } from './ngx-pull-to-refresh.service';

describe('NgxPullToRefreshService', () => {
  let service: NgxPullToRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPullToRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
