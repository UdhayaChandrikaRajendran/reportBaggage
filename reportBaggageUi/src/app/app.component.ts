import { Component, Injectable, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, takeUntil, takeWhile } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
interface IUser {
  originFrom: string;
  nickname: string;
  email: string;
  password: string;
  showPassword: boolean;
  travelDate: Date;

}
@Injectable()
export class AirportService {
  constructor(private http: HttpClient) {

  }
  getLocations(): Observable<any> {
    return this.http.get("../assets/airports.json");
  }
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [AirportService, HttpClient],
})
export class AppComponent implements OnInit {
  title = 'reportBaggageUi';
  reactiveForm!: FormGroup;
  user: IUser;
  unSubscribed$ = new Subject<void>();
  airportData: any;
  constructor(private airportService: AirportService) {
    this.user = {} as IUser;

  }

  ngOnInit(): void {
    // this.airportData = this.airportService.getLocations().pipe(takeUntil(this.unSubscribed$)).subscribe(
    //   response => {
    //     const keys = Object.keys(response);
    //     return keys.map(key => response[key]);
    //     this.airportData = response;
    //     console.log(response);
    //   }
    // );
    this.airportData = this.airportService.getLocations().pipe(
      map(response => {
        const keys = Object.keys(response);
        return keys.map(key => response[key]);
        this.airportData = response;
        console.log(response);
      })
    );

    console.log(this.airportData);
    this.reactiveForm = new FormGroup({
      requestdate: new FormControl(this.user.travelDate),
      originFrom: new FormControl(this.user.originFrom, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
      ]),
      nickname: new FormControl(this.user.nickname, [
        Validators.maxLength(10),
      ]),
      email: new FormControl(this.user.email, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250),
        //emailValidator(),
      ]),
      password: new FormControl(this.user.password, [
        Validators.required,
        Validators.minLength(15),
      ]),
    });
  }
  get requestdate() {
    return this.reactiveForm.get('requestdate')?.patchValue(this.formatDate(new Date()));
  }

  get name() {
    return this.reactiveForm.get('name')!;
  }

  get nickname() {
    return this.reactiveForm.get('nickname')!;
  }

  get email() {
    return this.reactiveForm.get('email')!;
  }

  get password() {
    return this.reactiveForm.get('password')!;
  }
  private formatDate(date: Date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  public validate(): void {
    if (this.reactiveForm.invalid) {
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();
      }
      return;
    }

    this.user = this.reactiveForm.value;

    console.info('Name:', this.user.originFrom);
    console.info('Nickname:', this.user.nickname);
    console.info('Email:', this.user.email);
    console.info('Password:', this.user.password);
  }
  ngOnDestroy(): void {
    this.unSubscribed$.next();
    this.unSubscribed$.complete();
  }
}