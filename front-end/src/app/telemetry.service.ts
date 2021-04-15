import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {

  AppInsights

  constructor() {
    this.AppInsights = new ApplicationInsights({
      config: {
        instrumentationKey: environment.azure_app_insights_instrumentation_key,
        enableAutoRouteTracking: true,
        /* ...Other Configuration Options... */
      }
    });
    this.AppInsights.loadAppInsights();
    this.AppInsights.trackPageView();
  }

  public logPageView(
    name: string,
    properties?: { [key: string]: string }) {

    this.AppInsights.trackPageView({
      name: name,
      properties: this.AddGlobalProperties(properties),
    });
  }

  public logEvent(name: string, properties?: { [key: string]: string }){
    this.AppInsights.trackEvent({
      name:name,
      properties: this.AddGlobalProperties(properties),
    });
  }

  public logError(error: Error, properties?: { [key: string]: string }){
    this.AppInsights.trackException({
      exception: error,
      properties: this.AddGlobalProperties(properties),
    });
  }

  private AddGlobalProperties(properties?: { [key: string]: string }):{ [key: string]: string } {
    // uncomment this when adding props
    /**
    if (!properties) {
      properties = {};
    }
    */

    //add your custom properties such as app version

    return properties;
  }
}
