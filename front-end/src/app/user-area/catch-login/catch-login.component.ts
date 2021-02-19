import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catch-login',
  templateUrl: './catch-login.component.html',
  styleUrls: ['./catch-login.component.sass']
})
export class CatchLoginComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    setTimeout(()=>{this.redirectToProjects()}, 5000);
  }

  redirectToProjects() {
    this.router.navigate(['/projects']);
  }
}
