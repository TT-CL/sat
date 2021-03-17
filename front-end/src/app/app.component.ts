import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})

export class AppComponent {
  title = 'Summary Evaluator';
  LOG_IN_INTERVAL: number = 5 //interval in minutes

  constructor(private auth: AuthService) {
    let ms_interval = this.LOG_IN_INTERVAL * 60 * 1000; //interval in ms

    const stopwatch = timer(500);  //after half a second, just in case
    const repeater = timer(0, ms_interval); //at the start, then every interval

    // Fire the function twice at first to ensure usability
    // Afterwards, refresh the token every LOG_IN_INTERVAL minutes
    repeater.subscribe(time => this.retrieveAuthToken(time));
    stopwatch.subscribe(time => this.retrieveAuthToken(time));
  }

  retrieveAuthToken(time) {
    console.log(`${time*this.LOG_IN_INTERVAL}mins`);
    console.log("retrieve auth token");
    this.auth.retrieveUserAuthToken();
  }
}