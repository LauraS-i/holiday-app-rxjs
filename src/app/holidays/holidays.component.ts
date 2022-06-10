import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CountriesHolidaysService} from "../services/countries-holidays.service";
import {Country} from "../interfaces/country";
import {HolidaysTableService} from "../services/holidays-table-service";
import {HolidayTable} from "../interfaces/holiday-table";

@Component({
    selector: 'app-holidays',
    templateUrl: './holidays.component.html',
    providers: [CountriesHolidaysService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolidaysComponent implements OnInit {
    countries$ = this.service.countries$;
    holidays$ = this.service.holidays$;
    //countriesNameArray: Array<String> = [];
    selectedValue1: Country = {code: '', name:''};
    selectedValue2: Country = {code: '', name:''};
    //firstHolidaysArray = this.service.firstCountryHolidays$.getValue();
    //secondHolidaysArray = this.service.secondCountryHolidays$.getValue();
    allHolidaysArray: Array<HolidayTable> = [];
    todaysDate: Date = new Date();
    datesAfterToday: Array<Date> = [];
    remainingTimeElement: string = '';
    closestDay: Date = new Date();


    constructor(private readonly service: CountriesHolidaysService, private readonly holidaysTableService: HolidaysTableService) {
    }

    ngOnInit(): void {
        this.service.init();
        this.service.loadCountries();
        //console.log(this.countries$)
        //console.log(this.firstHolidaysArray)
    }

    loadHolidays(countryCode: string, countryNumber: number) {
        console.log(countryCode)
        this.service.loadHolidays(countryCode, countryNumber);
    }
}
