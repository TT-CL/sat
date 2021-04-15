import { TestBed } from '@angular/core/testing';

import { TelemetryErrorHandlerService } from './telemetry-error-handler.service';

describe('TelemetryErrorHandlerService', () => {
  let service: TelemetryErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemetryErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
