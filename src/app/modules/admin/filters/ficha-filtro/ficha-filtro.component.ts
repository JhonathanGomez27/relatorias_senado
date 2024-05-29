import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { FiltersService } from '../filters.service';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { query } from '@angular/animations';
import { environment } from 'environments/environment';
import { SanitizedHtmlPipe } from '../../pipes/sanitizedPipe.pipe';

@Component({
    selector: 'app-ficha-filtro',
    templateUrl: 'ficha-filtro.component.html',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, MatPaginatorModule, MatFormFieldModule, MatInputModule, FormsModule, MatIconModule, MatButtonModule, ReactiveFormsModule, SanitizedHtmlPipe],
})

export class FichaFiltroComponent implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    routeBack: any = '';

    ficha: any = {};
    tags: any = [];
    subtitulos: any = [];
    totalResponse: number = 0;

    page: number = 0;

    //search bar
    searchControl: UntypedFormControl = new UntypedFormControl();
    debounce: number = 1500;
    loading: boolean = false;

    programa: any = {};

    initital: string = 'init';

    videoUrl: any = '';

    year:any = 'undefined';
    isVideo: boolean = true;

    params: any = {};

    myScriptElement: HTMLMediaElement;

    subtituloActual: string = '';

    limit: any = environment.pagination;

    totalPages: any = 0;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _filtersService: FiltersService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.myScriptElement = document.getElementById("myVideo") as HTMLMediaElement;

        this.activatedRoute.queryParams.subscribe(params => {
            if(params.busqueda && this.initital === 'init'){
                this.searchControl.setValue(params.busqueda)
            }
            this._changeDetectorRef.markForCheck();
        });

        this.initital = 'fin';

        this._filtersService.ficha.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {

            this.ficha = response.ficha;
            this.tags = response.tags;
            let anio = '';
            if(this.ficha.fechaEmision === ''){
                anio = 'undefined';
            }else{
                anio = this.ficha.fechaEmision.split('/')[2];
            }

            this.videoUrl = `http://3.18.149.205/assets/videos/${this.ficha.id_programa}/${anio}/${this.ficha.nombreArchivo}`;
            this._changeDetectorRef.markForCheck();

            this._changeDetectorRef.markForCheck();
        });

        this._filtersService.subtitulos.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {

            this.subtitulos = response?.subtitulos || [];
            this.totalResponse = response?.totalSubtitulos || 0;

            let paginas = Math.ceil(this.totalResponse / this.limit);
            this.totalPages = paginas;

            if(this.subtitulos.length){
                this.setCurTimePaginated();
            }

            this._changeDetectorRef.markForCheck();
        });

        this._filtersService.programa.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.programa = response.programa;
            this._changeDetectorRef.markForCheck();
        });

         // Subscribe to the search field value changes
         this.searchControl.valueChanges.pipe(debounceTime(this.debounce),takeUntil(this._unsubscribeAll)).subscribe((value) =>
         {
            if(!this.loading){
                this.buscarData();
            }
         });


         this.myScriptElement.ontimeupdate  = () => {
            this.checkSubtitles();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    //-----------------------------------
    // pagination
    //-----------------------------------

    buscarData(){
        this.page = 0;
        let pagina = 1;
        let data: any = {palabraClave: this.searchControl.value || ''};

        this.getSubtitulosPaginated(pagina, data);
        this._changeDetectorRef.markForCheck();
    }

    handlePageEnvent(event: PageEvent){
        this.loading = true;
        this.page = event.pageIndex;
        let pagina = event.pageIndex + 1;
        let data: any = {palabraClave: this.searchControl.value || ''};

        this.getSubtitulosPaginated(pagina, data);

        this._changeDetectorRef.markForCheck();
    }

    getSubtitulosPaginated(page:any, data:any){
        this._filtersService.getSubTitulosFichaPaginated(page, this.ficha.clavePrincipal, data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._filtersService.subtitulos = response;
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    //-----------------------------------
    // video options
    //-----------------------------------
    setCurTime(time: string){
        const result = time.split(':');
        const horas = parseInt(result[0]) * 3600;
        const minutos = parseInt(result[1]) * 60;
        const segundos = parseFloat(result[2].replaceAll(',','.'));
        const tiempo = horas + minutos + segundos;

        this.myScriptElement.currentTime = tiempo;
        this.myScriptElement.play();
        this.myScriptElement.muted = false;

        // this.videoPlayer.currentTime = tiempo;
    }

    setCurTimePaginated(){
        let ultimo = this.subtitulos[0].tiempo_Inicio.split(':');
        const horasu = parseInt(ultimo[0]) * 3600;
        const minutosu = parseInt(ultimo[1]) * 60;
        const segundosu = parseFloat(ultimo[2].replaceAll(',','.'));
        const tiempou = horasu + minutosu + segundosu;

        this.myScriptElement.currentTime = tiempou;
        this.myScriptElement.muted = false;
        this.myScriptElement.play();
    }

    checkSubtitles(){
        if(this.loading){
            return;
        }

        let ultimo = this.subtitulos[this.subtitulos.length - 1].tiempo_Fin.split(':');
        const horasu = parseInt(ultimo[0]) * 3600;
        const minutosu = parseInt(ultimo[1]) * 60;
        const segundosu = parseFloat(ultimo[2].replaceAll(',','.'));
        const tiempou = horasu + minutosu + segundosu;

        if(this.myScriptElement.currentTime > tiempou){
            if(this.page + 2 > this.totalPages){
                return;
            }
            this.myScriptElement.pause();

            this.loading = true;
            let data: any = {palabraClave: this.searchControl.value || ''};
            this.page = this.page + 1;
            this.getSubtitulosPaginated((this.page + 1), data);

            this._changeDetectorRef.markForCheck();

            return;
        }

        this.subtitulos.some(element => {
            const result = element.tiempo_Inicio.split(':');
            const horas = parseInt(result[0]) * 3600;
            const minutos = parseInt(result[1]) * 60;
            const segundos = parseFloat(result[2].replaceAll(',','.'));
            const tiempoInio = horas + minutos + segundos;

            const resultf = element.tiempo_Fin.split(':');
            const horasf = parseInt(resultf[0]) * 3600;
            const minutosf= parseInt(resultf[1]) * 60;
            const segundosf = parseFloat(resultf[2].replaceAll(',','.'));
            const tiempoFin = horasf + minutosf + segundosf;

            let temp = this.subtituloActual;

            if(tiempoInio < this.myScriptElement.currentTime && tiempoFin >  this.myScriptElement.currentTime){
                if(temp !== element.clavePrincipal){
                    this.subtituloActual = element.clavePrincipal;
                    this._changeDetectorRef.markForCheck();
                    return true;
                }
            }
        });
    }

    filterByTag(item: any){
        this.myScriptElement.pause();
        this.searchControl.setValue(item);
    }

    transformarData(value:any):String{
        if(this.searchControl.value === ''){
            return value;
        }
        const searchValue = this.searchControl.value;
        const regEx = new RegExp(searchValue, "ig");
        const temp =  value.replace(regEx, `<strong class="font-bold text-primary">${searchValue}</strong>`);
        return temp;
    }
}
