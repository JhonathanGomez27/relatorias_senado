import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DateAdapter, MAT_DATE_LOCALE, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, debounceTime, map, takeUntil } from 'rxjs';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FiltersService } from './filters.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-filters',
    standalone: true,
    templateUrl: './filters.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ MatSidenavModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatRadioModule, FormsModule, MatDatepickerModule, MatSelectModule, TitleCasePipe, MatMenuModule, MatPaginatorModule, RouterOutlet, RouterLink, ReactiveFormsModule, MatProgressSpinnerModule],
})
export class FiltersComponent implements OnInit, OnDestroy{

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    debounce: number = 1500;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    sortFilter: any = 'Todos';
    totalResultados: number = 0;
    buscar: boolean = false;

    //categorias variables
    programas: boolean = true;
    fichas: boolean = false;

    //search bar
    searchControl: UntypedFormControl = new UntypedFormControl();
    programFilterForm: UntypedFormGroup;
    fichasFilterForm: UntypedFormGroup;

    resultados: any = [];

    //pagination variables
    page: number = 0;

    //datos filtro
    formatos: any = [null, '240p', '1080p'];
    archivosRecibidos: any = [null, 'MXF', 'MPG4', 'AVI', 'MOV'];
    archivosGuardados = [null, 'MXF', 'MPG4', 'AVI', 'MOV'];
    resoluciones = [null, '1920x1080', '432x240'];
    soportesDigitales = [null, 'Digital', 'Umatic', 'Betacam sp', 'Betacam Digital', 'Mini DV', 'DV Cam', 'DVC Pro', 'Estado Sólido'];

    initial: string = 'init';

    programasList: any = [];

    programasSelected: any = {};
    idsQuery: any = {};

    idsSelected: any = [];

    constructor(
        private location: Location,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _adapter: DateAdapter<any>,
        private _formBuilder: UntypedFormBuilder,
        private _filterService: FiltersService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        // Initialize the form
        this.programFilterForm = this._formBuilder.group({
            criterio: [null],
            patrimonio: [null],
            idioma: [null],
            clasificacion: [null],
        });

        this.fichasFilterForm = this._formBuilder.group({
            formato: [null],
            tipoArchivoRecibido: [null],
            tipoArchivoGuardado: [null],
            resolucion: [null],
            soporteFisicoGrabacion: [null],
        });
    }

    ngOnInit(): void {
        this._filterService.resultados = {};
        this.activatedRoute.queryParams.subscribe(params => {
            if(!params.page){
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { page: '1' }});
                this.page = 0;
            }else{
                this.page = parseInt(params.page) - 1;
            }

            if(params.busqueda && this.initial === 'init'){
                this.searchControl.setValue(params.busqueda);
            }

            if(params.criterio){
                this.programFilterForm.get('criterio').setValue(params.criterio);
            }

            if(params.patrimonio){
                this.programFilterForm.get('patrimonio').setValue(params.patrimonio);
            }


            if(params.idioma){
                this.programFilterForm.get('idioma').setValue(params.idioma);
            }


            if(params.clasificacion){
                this.programFilterForm.get('clasificacion').setValue(params.clasificacion);
            }


            if(params.formato){
                this.fichasFilterForm.get('formato').setValue(params.formato);
            }

            if(params.tipoArchivoRecibido){
                this.fichasFilterForm.get('tipoArchivoRecibido').setValue(params.tipoArchivoRecibido);
            }

            if(params.soporteFisicoGrabacion){
                this.fichasFilterForm.get('soporteFisicoGrabacion').setValue(params.soporteFisicoGrabacion);
            }

            if(params.tipoArchivoGuardado){
                this.fichasFilterForm.get('tipoArchivoGuardado').setValue(params.tipoArchivoGuardado);
            }

            if(params.resolucion){
                this.fichasFilterForm.get('resolucion').setValue(params.resolucion);
            }

            if(params.idsProgramas){
                const listIdsProgramas = JSON.parse(params.idsProgramas);
                this.programasSelected = {...listIdsProgramas};
                this.idsQuery = {...listIdsProgramas};

                this.ordenarIds(this.idsQuery);
            }

            if(this.initial === 'init'){
                this.buttonFiltrar();
            }
        });

        this.initial = 'fin';

        this._filterService.resultados.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.resultados = response?.resultados || [];
            this.totalResultados = response?.total || 0;
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            ({matchingAliases}) =>{
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('md') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        );

        this._filterService.programas.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.programasList = response.data;
            this._changeDetectorRef.markForCheck();
        });

         // Subscribe to the search field value changes
        this.searchControl.valueChanges.pipe(debounceTime(this.debounce),takeUntil(this._unsubscribeAll)).subscribe((value) =>
        {
            if(value !== ''){
                // this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { busqueda: value }, queryParamsHandling: 'merge'});

                if(!this.buscar){
                    this.buttonFiltrar();
                }
                // console.log("object");
                this._changeDetectorRef.markForCheck();
            }else{
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { busqueda: null }, queryParamsHandling: 'merge'});

                this._changeDetectorRef.markForCheck();
            }
        });
    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // sort functions
    //-----------------------------------

    sortByOnChange(sort: any){
        this.sortFilter = sort;
    }

    //-----------------------------------
    // filter functions
    //-----------------------------------
    setQueryParam(campo: string, value:string){
        this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { [campo]: value }, queryParamsHandling: 'merge'});

        this._changeDetectorRef.markForCheck();
    }

    onCategoriaChange(categoria: any){
        if(categoria === 'programas'){
            this.fichas = !this.programas;
        }else{
            this.programas = !this.fichas;
        }

        this._changeDetectorRef.markForCheck();
    }

    buttonFiltrar(){
        this.buscar = true;
        this.page = 0;
        let pagina = this.page + 1;
        let programaF = this.programFilterForm.getRawValue();
        let fichasF = this.fichasFilterForm.getRawValue();

        for (const [key, value] of Object.entries(programaF)) {
            if(value === '' || value === null){
                delete programaF[key];
            }
        }

        for (const [key, value] of Object.entries(fichasF)) {
            if(value === '' || value === null){
                delete fichasF[key];
            }
        }

        let data = {
            programaFiltros: {
                ...programaF
            },
            fichaFiltros: {
                ...fichasF
            },
            palabraClave: this.searchControl.value || '',
            ids: this.idsSelected
        }

        if(data.palabraClave !== '' || Object.keys(data.fichaFiltros).length || Object.keys(data.programaFiltros).length){
            this.totalResultados = 0;
            this.filtroPaginated(pagina, data);
        }else{
            this.buscar = false;
        }
    }

    filtroPaginated(page:any, data:any){
        this._filterService.getFiltrosBusqueda(page, data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {

                this._filterService.resultados = response;
                this.buscar = false;

                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { busqueda: data.palabraClave }, queryParamsHandling: 'merge'});

                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.buscar = false;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    programaSelected(event:MatCheckboxChange, idValue: any): void {
        if(event.checked){
            this.idsQuery[idValue] = true;
        }else{
            delete this.idsQuery[idValue]
        }
        this.ordenarIds(this.idsQuery);

        let datos = JSON.stringify(this.idsQuery);
        if(datos === '{}'){
            datos = null;
        }

        this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { idsProgramas: datos }, queryParamsHandling: 'merge'});

        this._changeDetectorRef.markForCheck();
    }

    ordenarIds(data:any){
        this.idsSelected = [];
        for(const [key, value] of Object.entries(data)){
            this.idsSelected.push(key);
        }
    }

    //-----------------------------------
    // Paginator section
    //-----------------------------------
    handlePageChangeEvent(event: PageEvent){
        let pagina = event.pageIndex + 1;

        let programaF = this.programFilterForm.getRawValue();
        let fichasF = this.fichasFilterForm.getRawValue();

        for (const [key, value] of Object.entries(programaF)) {
            if(value === '' || value === null){
                delete programaF[key];
            }
        }

        for (const [key, value] of Object.entries(fichasF)) {
            if(value === '' || value === null){
                delete fichasF[key];
            }
        }

        let data = {
            programaFiltros: {
                ...programaF
            },
            fichaFiltros: {
                ...fichasF
            },
            palabraClave: this.searchControl.value || '',
        }

        if(data.palabraClave !== '' || Object.keys(data.fichaFiltros).length || Object.keys(data.programaFiltros).length){
            this.filtroPaginated(pagina, data);
        }else{
            this.buscar = false;
        }
    }

    //-----------------------------------
    // Functions images
    //-----------------------------------
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
    // router functions
    //-----------------------------------
    back(): void {
        this.location.back();
    }
}
