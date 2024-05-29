import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { HomeProgramService } from '../home.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatCheckboxModule, FuseDrawerComponent, RouterOutlet, RouterLink, NgIf, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
})
export class ListComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    sortFilter: any = 'Alfabeticamente: Ascendente';

    page: any = 1;
    totalProgramas: any = 0;
    debounce: number = 1500;

    programas: any = [];

    //search bar
    searchControl: UntypedFormControl = new UntypedFormControl();

    loading: boolean = false;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _homProgramsService: HomeProgramService,
        private _changeDetector: ChangeDetectorRef
    ){

    }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
                if(!params.page){
                    this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: '1' }});
                    this.page = 1;
                }else{
                    this.page = params.page;
                }
                this._changeDetector.markForCheck();
            }
        );

        this._homProgramsService.programas.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.programas = response.data;
                this.totalProgramas = response.total;

                this._changeDetector.markForCheck();
            }
        );

        // Subscribe to the search field value changes
        this.searchControl.valueChanges.pipe(debounceTime(this.debounce),takeUntil(this._unsubscribeAll)).subscribe((value) =>
        {
            if(value !== ''){
                this.router.navigate(['/programas/filtro'], {queryParams: {busqueda: value}});
            }

            this._changeDetector.markForCheck();
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getImgRoute(imagen: any): string{
        let image: string = '';
        if(imagen !== null){
            let result = imagen.split("html/")[1];
            image = `http://3.18.149.205/${result}`;
        }else{
            image = "assets/images/dashboard/thumbnail.png";
        }

        return image;
    }

    //-----------------------------------
    // sort functions
    //-----------------------------------

    sortByOnChange(sort: any, orden: any){
        if(this.loading){
            return;
        }

        this.loading = true;

        this.sortFilter = sort;
        this._homProgramsService.getProgramasOrdenados(1, orden).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._homProgramsService.programas = response;
                this.loading = false;

                this._changeDetector.markForCheck();
            },(error) => {
                this.loading = false;
                this._changeDetector.markForCheck();
            }
        );
    }
}
