import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
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

