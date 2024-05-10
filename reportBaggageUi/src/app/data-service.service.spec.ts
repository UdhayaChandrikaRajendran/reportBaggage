import { TestBed } from '@angular/core/testing';

import { DataService } from './data-service.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('DataServiceService', () => {
  let service: DataService;
  let httpClient: HttpClient;
  let expectedLocations: any;
  let expectedCurrency: any;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      providers: [HttpClient]
    });

    service = TestBed.inject(DataService);
    expectedLocations = ['Albuquerque International Airport'];
    expectedCurrency = ['INR'];
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected locations (called once)', () => {
    service.getLocations().subscribe(
      data => expect(data).toEqual(expectedLocations, 'should return expected data'),
      fail
    );
    const url = "../assets/airports.json";
    // DataService should have made one request to GET data from expected URL
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock locations
    req.flush(expectedLocations);
  });
  it('should return expected currency (called once)', () => {
    service.getcurrencyFormat().subscribe(
      data => expect(data).toEqual(expectedCurrency, 'should return expected data'),
      fail
    );
    const url = "../assets/currencyFormat.json";
    // DataService should have made one request to GET data from expected URL
    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock currency
    req.flush(expectedCurrency);
  });
});
