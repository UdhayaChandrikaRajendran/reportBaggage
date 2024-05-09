import { Component, Injectable, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, observable, takeUntil, takeWhile } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
interface UserItemArray {
  quantity: number;
  item: string;
  cost: number;
}
interface IUser {
  date: Date;
  origin: string;
  departure: string;
  baggage: string;
  currency: string;
  items: UserItemArray[];
  claim: number;
}
@Injectable()
export class DataService {
  constructor(private http: HttpClient) {

  }
  getLocations(): Observable<any> {
    return this.http.get("../assets/airports.json");
  }
  getcurrencyFormat(): Observable<any> {
    return this.http.get("../assets/currencyFormat.json");
  }
}
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
  unSubscribed$ = new Subject<void>();
  airportData: any;
  currencyFormat$!: Observable<string[]>;
  formSubmit = false;
  totalAmount = 0;
  constructor(private dataService: DataService, private formBuilder: FormBuilder) {
    // this.user = {} as IUser;
    //this.user.totalClaim = 0;
  }

  ngOnInit(): void {

    this.airportData = this.dataService.getLocations().pipe(
      map(response => {
        const keys = Object.keys(response);
        return keys.map(key => response[key]);
      })
    );
    this.currencyFormat$ = this.dataService.getcurrencyFormat().pipe(
      map(response => {
        return Object.keys(response);
      })
    );

    this.reactiveForm = new FormGroup({
      date: new FormControl(''),
      origin: new FormControl('', [
        Validators.required,

      ]),
      departure: new FormControl('', [
        Validators.required

      ]),
      baggage: new FormControl('', []),
      currency: new FormControl('', [
        Validators.required]),
      items: new FormArray([]),

      claim: new FormControl(''),

    });
    this.addItem();
  }
  get items() {
    return <FormArray>this.reactiveForm.get('items');
  }
  calculate_cost(index: number) {
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
      item: [''],
      quantity: [''],
      cost: ['']
    });
  }
  isObject(values: any) {
    console.log(values);
    if (!Array.isArray(values)) {
      return false;
    }
    else {
      return true;
    }
  }
  public validate(): void {
    if (this.reactiveForm.valid) {
      this.formSubmit = true;
      this.user = this.reactiveForm.value;
      console.log(this.user);
      for (const control of Object.keys(this.reactiveForm.controls)) {
        this.reactiveForm.controls[control].markAsTouched();

      }
      return;
    }


  }

}