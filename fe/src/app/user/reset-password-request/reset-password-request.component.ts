import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmailValidator } from 'src/shared/validation';
import { GlobalEventManagerService } from '../../core/global-event-manager.service';
import { UserControllerService } from 'src/api/api/userController.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reset-password-request',
  templateUrl: './reset-password-request.component.html',
  styleUrls: ['./reset-password-request.component.scss']
})
export class ResetPasswordRequestComponent implements OnInit {

  submitted = false;
  sent = false;

  constructor(
    protected globalEventsManager: GlobalEventManagerService,
    private userController: UserControllerService,
    private location: Location
  ) { }

  form = new FormGroup({
    email: new FormControl(null, [Validators.required, EmailValidator()]),
  });

  ngOnInit(): void {
  }

  resetPassword(){
    this.submitted = true;
    this.sent = false;
    if (!this.form.invalid) {
      this.globalEventsManager.showLoading(true);
      const sub = this.userController.requestResetPassword({
        email: this.form.get('email').value
      }).subscribe(val => {
        sub.unsubscribe();
        this.globalEventsManager.showLoading(false);
        this.sent = true;
      },
        error => {
          this.globalEventsManager.showLoading(false);
        }
      );
    }
  }

  goBack(): void {
    this.location.back();
  }

}
