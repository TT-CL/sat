import { Component } from '@angular/core';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
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

    const stopwatch1 = timer(0)   //at the start
    const stopwatch2 = timer(500);  //after half a second, just in case
    const repeater = timer(ms_interval, ms_interval);

    // Fire the function twice at first to ensure usability
    // Afterwards, refresh the token every LOG_IN_INTERVAL minutes
    stopwatch1.subscribe(() => {
      this.auth.retrieveUserAuthTokenAndRediect()
    });
    stopwatch2.subscribe(() => this.auth.retrieveUserAuthToken());
    repeater.subscribe(time => this.retrieveAuthToken(time));
  }

  retrieveAuthToken(time) {
    console.log(`${time*this.LOG_IN_INTERVAL+1}mins`);
    console.log("retrieve auth token");
    this.auth.retrieveUserAuthToken();
  }
}