import { Component, Injectable, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, observable, takeUntil, takeWhile } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IUser, baggageDetails, setBaggageInfo } from './reducers';
import { Store } from '@ngrx/store';
import { DataService } from './data-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [DataService, HttpClient],
})
export class AppComponent implements OnInit {
  title = 'reportBaggageUi';
  reactiveForm!: FormGroup;
  user!: IUser;
  userData$!: Observable<IUser>;
  unSubscribed$ = new Subject<void>();
  airportData$!: Observable<any>;;
  currencyFormat$!: Observable<string[]>;
  formSubmit = false;
  totalAmount = 0;
  infos: string[] = [''];
  maxDate = new Date();
  formErrror: string[] = [];
  formValid: boolean = false;
  constructor(private dataService: DataService, private formBuilder: FormBuilder, public store: Store) { }


  ngOnInit(): void {
    this.initializeData();

    this.reactiveForm = new FormGroup({
      date: new FormControl('', [Validators.required]),
      origin: new FormControl('', [Validators.required]),
      departure: new FormControl('', [Validators.required]),
      baggage: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      items: new FormArray([], [Validators.required]),
      claim: new FormControl('', [Validators.required])
    },
      {
        validators: [this.compareOriginDeparture]
      });
    this.addItem();
  }
  initializeData() {
    this.userData$ = this.store.select(baggageDetails);
    this.airportData$ = this.dataService.getLocations().pipe(
      map(response => {
        const keys = Object.keys(response);
        return keys.map(key => response[key]);
      })
    );

    this.dataService.getLocations().pipe(takeUntil(this.unSubscribed$)).subscribe(
      response => {
        const keys = Object.keys(response);
        let locationList = keys.map(key => response[key]);
        this.infos = locationList.map(element => element.airport.name);
      });
    this.currencyFormat$ = this.dataService.getcurrencyFormat().pipe(
      map(response => {
        return Object.keys(response);
      })
    );
  }
  get items() {
    return <FormArray>this.reactiveForm.get('items');
  }
  calculate_cost() {
    this.totalAmount = this.items.value.reduce((acc: any, curr: any) => {
      acc += (curr.cost || 0);
      return acc;
    }, 0);
    this.reactiveForm.get('claim')!.setValue(this.totalAmount);
  }
  addItem() {
    let newSet = this.getUserForm();
    this.items.push(newSet);
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }
  getUserForm() {
    return this.formBuilder.group({
      item: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required])
    });
  }
  isObject(values: any) {
    if (!Array.isArray(values)) {
      return false;
    }
    else {
      return true;
    }
  }
  public validate(): void {
    this.formErrror = [];
    this.compareLocationWithData(this.reactiveForm);
    this.formSubmit = true;
    if (this.reactiveForm.errors && this.reactiveForm.errors['samelocation']) this.formErrror?.push('select Different origin and Departure');
    this.showMandatoryError();
    if (this.reactiveForm.valid) {
      this.formValid = true;
      this.user = this.reactiveForm.value;
      this.store.dispatch(setBaggageInfo({ model: this.user }));
       return;
    }
  }

  showMandatoryError() {
    Object.keys(this.reactiveForm.controls).forEach(key => {
      const controlErrors = this.reactiveForm.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const showMessage = key + " is " + keyError
          this.formErrror.push(showMessage)
          //this.fieldError = this.errors[0]
        });
      }
    });
    if (this.formErrror.length > 3) {
      this.formErrror = [];
      this.formErrror.push("Enter complete details for all the fields")
    }
    if (this.formErrror.length === 0 && this.reactiveForm.invalid) {
      this.formErrror.push("Enter all the details for every items")
    }
  }
  compareLocationWithData(control: AbstractControl): void {
    const origin = control.get('origin');
    const departure = control.get('departure');

    if (origin?.value && !this.infos?.includes(origin?.value)) {
      this.reactiveForm.setErrors({ 'select correct Origin': true });
      this.formErrror?.push('select correct Origin');
    }


    if (departure?.value && !this.infos?.includes(departure?.value)) {
      this.formErrror?.push('select correct departure');
      this.reactiveForm.setErrors({ 'select correct departure': true });
    }
  }
  compareOriginDeparture(control: AbstractControl): ValidationErrors | null {
    const origin = control.get('origin');
    const departure = control.get('departure');
    if (origin?.value && departure?.value && origin?.value === departure?.value) {
      return { 'samelocation': true };
    }
    return null;
  }
  ngOnDestroy(): void {
    this.unSubscribed$.next();
    this.unSubscribed$.complete();
  }
}