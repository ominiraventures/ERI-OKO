import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-activation',
  templateUrl: './register-activation.component.html',
  styleUrls: ['./register-activation.component.scss']
})
export class RegisterActivationComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  toLogin(): void {
    this.router.navigate(['login']).then();
  }

}
