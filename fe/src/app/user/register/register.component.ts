import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EmailValidator } from 'src/shared/validation';
import { UserControllerService } from 'src/api/api/userController.service';
import { GlobalEventManagerService } from 'src/app/core/global-event-manager.service';
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  _registerErrorStatus$: BehaviorSubject<string>;

  constructor(
    public userController: UserControllerService,
    protected globalEventsManager: GlobalEventManagerService,
    private router: Router
    ) {}

  ngOnInit(): void {
    this._registerErrorStatus$ = new BehaviorSubject<string>("");
  }

  registerForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    surname: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, EmailValidator()]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    condition: new FormControl(null, [this.conditionConfirmation.bind(this)])
  })

  conditionConfirmation(control: AbstractControl): ValidationErrors | null {
    const condition = control.value
    return condition === true ? null : { conditionsNotConfirmed: true }
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  submitted: boolean = false
  onSubmit() {
    this._registerErrorStatus$.next("");
    this.submitted = true
    if (!this.registerForm.invalid) {
      let sub = this.userController.createUser(this.registerForm.value)
        .subscribe(val => {
          this.router.navigate(['/account-activation']);
          sub.unsubscribe()
          this.globalEventsManager.showLoading(false);
        },
        error => {
          this._registerErrorStatus$.next(error.error.status);
          this.globalEventsManager.showLoading(false);
        }
      )
    }
  }

}
