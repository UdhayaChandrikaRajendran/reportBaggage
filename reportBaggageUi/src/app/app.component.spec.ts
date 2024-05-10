import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataService } from './data-service.service';


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  const dataServiceSpy = jasmine.createSpyObj('DataService', ['getLocations', 'getcurrencyFormat'])
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [provideMockStore({}),
      { provide: DataService, useValue: dataServiceSpy }]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
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
});

