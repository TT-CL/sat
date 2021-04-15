import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { TelemetryService } from './telemetry.service';

@Injectable({
  providedIn: 'root'
})
export class TelemetryErrorHandlerService extends ErrorHandler{

  constructor(private injector: Injector) {
    super();
  }

  handleError(error: any): void {
    const telemetryService = this.injector.get(TelemetryService);
    telemetryService.logError(error);
    super.handleError(error);
  }
}
