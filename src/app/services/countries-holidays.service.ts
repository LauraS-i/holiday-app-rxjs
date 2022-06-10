import {HttpClient} from '@angular/common/http';
import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {CountriesResponse} from "../interfaces/countries-response";
import {ApiConstants} from "../api.constants";
import {Country} from "../interfaces/country";
import {HolidayObject} from "../interfaces/holiday-object";
import {Holiday} from "../interfaces/holiday";
import {HolidayTable} from "../interfaces/holiday-table";

@Injectable()
export class CountriesHolidaysService {
    readonly countries$ = new BehaviorSubject<Country[]>([]);

    readonly holidays$ = new BehaviorSubject<HolidayTable[]>([]);

    readonly firstCountryHolidays$ = new BehaviorSubject<Holiday[]>([]);

    readonly secondCountryHolidays$ = new BehaviorSubject<Holiday[]>([]);

    constructor(private readonly http: HttpClient) {
    }

    init(): void {
        combineLatest([this.firstCountryHolidays$, this.secondCountryHolidays$])
            .pipe(
                map(([firstCountryHolidays, secondCountryHolidays]: [Holiday[], Holiday[]]): HolidayTable []=> {
                    const combinedData: Holiday[] = [...firstCountryHolidays, ...secondCountryHolidays];
                    combinedData.sort((a: Holiday, b: Holiday) => {
                        return (
                            new Date(a.date).valueOf() - new Date(b.date).valueOf() ||
                            a.name.localeCompare(b.name)
                        )
                    });
                    let hasClosestDate = false;
                    //console.log()
                    return combinedData.map((holiday: Holiday, index) => {

                        let checkIfTwoDatesAreEqual;
                            if (index < combinedData.length - 1) {
                                checkIfTwoDatesAreEqual =
                                    new Date(holiday.date).valueOf() ===
                                    new Date(combinedData[index + 1].date).valueOf();
                            }

                            let date;
                            let firstCountry = '-';
                            let secondCountry = '-';
                            let closest = false;
                            if (checkIfTwoDatesAreEqual) {
                                console.log(checkIfTwoDatesAreEqual)
                                date = new Date(holiday.date).toLocaleString('default', {month: 'long'}) + '  ' + new Date(combinedData[index].date).getDate()
                                firstCountry = holiday.name
                                secondCountry = holiday.name
                            } else {
                                console.log(checkIfTwoDatesAreEqual)

                                if (holiday.country === 1) {
                                    date = new Date(combinedData[index].date).toLocaleString('default', {month: 'long'}) + '  ' + new Date(combinedData[index].date).getDate()
                                    firstCountry = combinedData[index].name
                                } else {
                                    date = new Date(combinedData[index].date).toLocaleString('default', {month: 'long'}) + '  ' + new Date(combinedData[index].date).getDate()
                                    secondCountry = holiday.name
                                }
                            }

                            if (!hasClosestDate && new Date(holiday.date) > new Date()) {
                                hasClosestDate = true;
                                closest = true;
                            }
                            return {date, firstCountryHolidayName: firstCountry, secondCountryHolidayName:secondCountry, closest};
                        }
                    );
                })
            )
            .subscribe((data: any) => {
                console.log(data)
                const filteredArr = data.reduce((thing: any, current: any) => {
                    const x = thing.find((item:any ) => item.date === current.date);
                    if (!x) {
                        return thing.concat([current]);
                    } else {
                        return thing;
                    }
                }, []);
                console.log(filteredArr)
                this.holidays$.next(filteredArr);
            });
    }

    loadCountries(): void {
        const countryUrl = `${ApiConstants.URL_BASE_COUNTRIES}key=${ApiConstants.API_KEY}`;
        this.http
            .get<CountriesResponse>(countryUrl)
            .pipe(
                map((data: CountriesResponse) => {
                    return data.countries.map((country: Country) => ({name: country.name, code: country.code}));
                })
            )
            .subscribe((data: Country[]) => {
                this.countries$.next(data);
                //console.log(this.countries$)
            });
    }

    loadHolidays(code: string, countryNumber: number): void {
        this.http.get<HolidayObject>(`${ApiConstants.URL_BASE_HOLIDAYS}?key=${ApiConstants.API_KEY}&country=${code}&year=2021&language=hu`)
            .pipe(
                map((data: HolidayObject) => {
                    return data.holidays.map((holiday: Holiday) => ({
                        date: (new Date(new Date().getFullYear(), new Date(holiday.date).getMonth(), new Date(holiday.date).getDate())).toDateString(),
                        name: holiday.name,
                        country: countryNumber
                    }));
                }))
            .subscribe((data: Holiday[]) => {
                //console.log(data)
                if (countryNumber === 1) {
                    this.firstCountryHolidays$.next(data);
                } else {
                    this.secondCountryHolidays$.next(data);
                }
            });
    }
}
