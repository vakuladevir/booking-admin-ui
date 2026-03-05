import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { LoginInfoService } from 'src/app/services/loginInfo.service';
import { GeneralRespVO } from 'src/app/model/generalRespVO.model';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.scss']
})
export class LoginComponentComponent implements OnInit {

  ngOnInit(): void {
  }

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private loginInfoService: LoginInfoService,) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loginInfoService.userLogin(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe(
          (resp: GeneralRespVO) => {
            if (resp.message === 'Login successful') {
              sessionStorage.setItem('UserInfo.username', resp.userName);
              this.router.navigate(['/home']); // Redirect on success
            } else {
              this.showErrorModal();
            }
          },
          error => {
            this.showErrorModal();
          }
        );
    }
  }

  showErrorModal() {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal')!);
    errorModal.show();
  }

}
