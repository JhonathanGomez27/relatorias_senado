import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { HomeProgramService } from '../../home.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-program-years',
  standalone: true,
  templateUrl: './program-years.component.html',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterOutlet, RouterLink, NgIf],
})
export class ProgramYearsComponent implements OnInit{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    dataYears: any = [];

    constructor(
        private _programService: HomeProgramService,
        private route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef
    ){
        _programService.yearSelected = '';
    }

    ngOnInit(): void {
        this._programService.yearSelected = '';
        this._programService.routeBack = `/programas`;

        this._programService.programa.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.dataYears = response.emisionArray;
            this._changeDetectorRef.markForCheck();
        });
    }

    setyear(year:any):void{
        this._programService.yearSelected = year;
    }
}
