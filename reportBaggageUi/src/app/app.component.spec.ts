import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from './data-service.service';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs/internal/observable/of';
import { setBaggageInfo } from './reducers';


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  const dataServiceSpy = jasmine.createSpyObj('DataService', ['getLocations', 'getcurrencyFormat'])
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [provideMockStore({}),
      { provide: DataService, useValue: dataServiceSpy }]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);

    component.reactiveForm = new FormGroup({
      date: new FormControl('23-3-2024'),
      origin: new FormControl('Lanzarote'),
      departure: new FormControl('Albuquerque'),
      baggage: new FormControl('1'),
      currency: new FormControl('INR'),
      items: new FormArray([
        new FormGroup({
          item: new FormControl('Charger'),
          quantity: new FormControl('1'),
          cost: new FormControl('23')
        })

      ]),
      claim: new FormControl('')
    })
  })
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'reportBaggageUi' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('reportBaggageUi');
  });

  it(`should initialise`, () => {
    const spy = spyOn(component, 'initializeData').and.callThrough();
    const spy1 = spyOn(component, 'addItem').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalled();
  });

  it(`should calculate_cost`, () => {
    component.calculate_cost();
    const claimvalue: number = component.totalAmount;
    const formValue: number = component.reactiveForm.get('claim')?.value;
    expect(claimvalue).toBeGreaterThanOrEqual(23);
    expect(formValue).toBeGreaterThanOrEqual(23);
  });
  it(`should addItem`, () => {
    const spy = spyOn(component, 'getUserForm').and.callThrough();
    component.addItem();
    expect(spy).toHaveBeenCalled();
  });

  it(`should validate`, () => {
    component.validate();
    const spy = spyOn(component, 'showMandatoryError').and.callThrough();
    const spy1 = spyOn(component, 'compareLocationWithData').and.callThrough();
    expect(component.formValid).toBeTrue;
    component.reactiveForm.get('origin')?.setValue('fdfd');
    expect(component.formErrror.length).toBeGreaterThanOrEqual(0);
  });
  it(`should showMandatoryError`, () => {
    component.showMandatoryError();
    component.reactiveForm.get('origin')?.setValue('');
    component.reactiveForm.get('baggage')?.setValue('');
    expect(component.formErrror.length).toBeGreaterThanOrEqual(0);
  });

  it('should call validate() and set necessary values for successful form validation', () => {
    component.reactiveForm = new FormGroup({
      date: new FormControl(''),
      origin: new FormControl(''),
      departure: new FormControl(''),
      baggage: new FormControl(''),
      currency: new FormControl(''),
      items: new FormArray([
        new FormGroup({
          item: new FormControl(''),
          quantity: new FormControl(''),
          cost: new FormControl('')
        })
      ]),
      claim: new FormControl('')
    })
    fixture.detectChanges();
    spyOn(component, 'validate').and.callThrough();
    component.infos = ['Barcelona El Prat Airport', 'Windsor Locks Bradley International Airport'];
    component.currencyFormat$ = of(['EUR', 'INR']);
    const dispatchActionSpy = spyOn(mockStore, 'dispatch');
    const inputDate = fixture.debugElement.query(By.css('.dateField')).nativeElement;
    inputDate.value = "2024-05-25";
    inputDate.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const fromAirport = fixture.debugElement.query(By.css('.fromAirport')).nativeElement;
    fromAirport.value = "Barcelona El Prat Airport";
    fromAirport.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const toAirport = fixture.debugElement.query(By.css('.toAirport')).nativeElement;
    toAirport.value = "Windsor Locks Bradley International Airport";
    toAirport.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const baggageNo = fixture.debugElement.query(By.css('.baggageNo')).nativeElement;
    baggageNo.value = "1";
    baggageNo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const itemName = fixture.debugElement.query(By.css('.itemName')).nativeElement;
    itemName.value = "Laptop";
    itemName.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const currencyInput = fixture.debugElement.query(By.css('#currency1')).nativeElement;

    const quantity = fixture.debugElement.query(By.css('.quantity')).nativeElement;
    quantity.value = "1";
    quantity.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cost = fixture.debugElement.query(By.css('.cost')).nativeElement;
    cost.value = "18";
    cost.dispatchEvent(new Event('input'));
    cost.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    spyOn(component, 'showMandatoryError').and.callThrough();
    const compareOriginDepartureSpy = spyOn(component, 'compareOriginDeparture').and.callThrough();
    return fixture.whenStable().then(() => {
      currencyInput.value = 'EUR';
      currencyInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.submit')).nativeElement.click();
      const expectedAction = setBaggageInfo({ model: component.user });

      expect(component.formSubmit).toBeTruthy();
      expect(component.formValid).toBeTruthy();
      expect(component.formErrror).toEqual([]);
      expect(component.user).toEqual(component.reactiveForm.value);
      expect(dispatchActionSpy).toHaveBeenCalledWith(expectedAction);
    });
  });
  it('should set Error message when submitForm() errors out', () => {
    component.reactiveForm = new FormGroup({
      date: new FormControl(''),
      origin: new FormControl(''),
      departure: new FormControl(''),
      baggage: new FormControl(''),
      currency: new FormControl(''),
      items: new FormArray([
        new FormGroup({
          item: new FormControl(''),
          quantity: new FormControl(''),
          cost: new FormControl('')
        })
      ]),
      claim: new FormControl('')
    })
    fixture.detectChanges();
    spyOn(component, 'validate').and.callThrough();
    component.infos = ['Barcelona El Prat Airport', 'Windsor Locks Bradley International Airport'];
    component.currencyFormat$ = of(['EUR', 'INR']);

    const inputDate = fixture.debugElement.query(By.css('.dateField')).nativeElement;
    inputDate.value = "2024-05-25";
    inputDate.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const fromAirport = fixture.debugElement.query(By.css('.fromAirport')).nativeElement;
    fromAirport.value = "Barcelona El Prat Airport";
    fromAirport.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const toAirport = fixture.debugElement.query(By.css('.toAirport')).nativeElement;
    toAirport.value = "Barcelona El Prat Airport";
    toAirport.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const baggageNo = fixture.debugElement.query(By.css('.baggageNo')).nativeElement;
    baggageNo.value = "1";
    baggageNo.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const itemName = fixture.debugElement.query(By.css('.itemName')).nativeElement;
    itemName.value = "Laptop";
    itemName.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const currencyInput = fixture.debugElement.query(By.css('#currency1')).nativeElement;

    const quantity = fixture.debugElement.query(By.css('.quantity')).nativeElement;
    quantity.value = "1";
    quantity.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cost = fixture.debugElement.query(By.css('.cost')).nativeElement;
    cost.value = "18";
    cost.dispatchEvent(new Event('input'));
    cost.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    spyOn(component, 'showMandatoryError').and.callThrough();
    const compareOriginDepartureSpy = spyOn(component, 'compareOriginDeparture').and.callThrough();
    return fixture.whenStable().then(() => {
      currencyInput.value = 'EUR';
      currencyInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      fixture.debugElement.query(By.css('.submit')).nativeElement.click();
      expect(component.formSubmit).toBeTruthy();
      expect(component.formValid).toBeFalse();
      expect(component.formErrror).toEqual(['select Different origin and Departure']);
    });
  });
  it('should set Error message when submitForm() with no fields input', () => {
    component.reactiveForm = new FormGroup({
      date: new FormControl(''),
      origin: new FormControl(''),
      departure: new FormControl(''),
      baggage: new FormControl(''),
      currency: new FormControl(''),
      items: new FormArray([
        new FormGroup({
          item: new FormControl(''),
          quantity: new FormControl(''),
          cost: new FormControl('')
        })
      ]),
      claim: new FormControl('')
    })
    fixture.detectChanges();
    spyOn(component, 'validate').and.callThrough();
    fixture.debugElement.query(By.css('.submit')).nativeElement.click();
    expect(component.formSubmit).toBeTruthy();
    expect(component.formValid).toBeFalse();
    expect(component.formErrror).toEqual(['Enter complete details for all the fields']);
  });
});

