import { Component, OnInit, NgZone } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import { StorageService } from '../../storage.service';

import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-nav-auth-widget',
  templateUrl: './nav-auth-widget.component.html',
  styleUrls: ['./nav-auth-widget.component.sass']
})
export class NavAuthWidgetComponent implements OnInit{

  userObserver = {
    next: user => {
      this.user = user;
      if(user){
        console.log("User just logged in");
        this.userSignedIn = true;
      }
    },
    error: err => console.error('User observer got an error: ' + err),
    complete: () => console.log('User observer got a complete notification'),
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private storage: StorageService) {
        storage.getUser().subscribe(this.userObserver);

        //listen to router change events to hide the login button when redundant
        router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
          if(event.url == "/" || event.url == "/log-in"){
            this.landingArea=true;
          }else{
            this.landingArea=false;
          }
        });
  }

  public gapiSetup: boolean = false; // marks if the gapi library has been loaded
  public authInstance: gapi.auth2.GoogleAuth;
  public error: string;
  public user: gapi.auth2.GoogleUser;
  public userSignedIn: boolean = false;
  public userAvatar: string = "";
  public userName: string = "";
  public landingArea:boolean = true;

  rerouteToRoot(){
    this.zone.run(() => this.router.navigate(['/']));
  }

  async ngOnInit() {
    if (await this.checkIfUserAuthenticated()) {
      this.user = this.authInstance.currentUser.get() as gapi.auth2.GoogleUser;
      console.log(this.user.getBasicProfile());
      this.userAvatar=this.user.getBasicProfile().getImageUrl();
      this.userName=this.user.getBasicProfile().getGivenName();
      this.userSignedIn = this.user.isSignedIn();
      this.storage.setUser(this.user);
      /**
      This is not the correct place to check if the user is allowed to enter this area
      due to await this piece of code will always wait for a valid user.
      console.log("flag");
      //check to redirect to homepage when not logged in
      const forbidden_paths = ['editor','project'];
      const reroute = (segment) => forbidden_paths.includes(segment.path);
      if(!this.user.isSignedIn() && this.route.snapshot.url.some(reroute)){
        this.rerouteToRoot();
      }else{
        console.log("not rerouting");
      }
      **/
    }
  }


  async initGoogleAuth(): Promise<void> {
    //  Create a new Promise where the resolve
    // function is the callback passed to gapi.load
    const pload = new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });

    // When the first promise resolves, it means we have gapi
    // loaded and that we can call gapi.init
    return pload.then(async () => {
      await gapi.auth2
        .init({ client_id: environment.googleOAuthSecret })
        .then(auth => {
          this.gapiSetup = true;
          this.authInstance = auth;
        });
    });
  }

  async logOut(): Promise<any> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    // Resolve or reject signin Promise
    return new Promise(async () => {
      await this.authInstance.signOut().then(
        res => {
          console.log("logged out");
          this.userSignedIn = false;
          this.rerouteToRoot();
        },
        error => this.error = error);
    });
  }

  async checkIfUserAuthenticated(): Promise<boolean> {
    // Initialize gapi if not done yet
    if (!this.gapiSetup) {
      await this.initGoogleAuth();
    }

    return this.authInstance.isSignedIn.get();
  }
}
