import { TestBed } from '@angular/core/testing';

import { WebPushDashboardService } from './web-push-dashboard.service';

describe('WebPushDashboardService', () => {
  let service: WebPushDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebPushDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
