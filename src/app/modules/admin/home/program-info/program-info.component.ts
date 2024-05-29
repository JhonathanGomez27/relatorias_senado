import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { HomeProgramService } from '../home.service';
import { Observable, Subject, catchError, debounceTime, map, of, takeUntil } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { SanitizedHtmlPipe } from '../../pipes/sanitizedPipe.pipe';

@Component({
  selector: 'app-program-info',
  standalone: true,
  templateUrl: './program-info.component.html',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatPaginatorModule, SanitizedHtmlPipe],
})
export class ProgramInfoComponent implements OnInit, OnDestroy, AfterViewInit{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('videoPlayer', {static: true}) videoPlayer: ElementRef;

    myScriptElement: HTMLVideoElement;

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

    initital: string = 'init';

    videoUrl: any = '';

    year:any = 'undefined';
    isVideo: boolean = true;

    params: any = {};
    programa: any = {};

    subtituloActual: string = '';

    limit: any = environment.pagination;

    totalPages: any = 0;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _programService: HomeProgramService,
        private _changeDetectorRef: ChangeDetectorRef,
        private httpCliente: HttpClient
    ){
        this.activatedRoute.params.subscribe((params) => {
            this.routeBack = `/programas/ver/${params.programa}/${params.year}`;
            this.params = params;
            this.year = params.year;
            // this._programService.routeBack = `/programas/ver/${params.programa}/${params.year}`;
        })
    }

    ngOnInit(): void {
        this.myScriptElement = this.videoPlayer.nativeElement;
        // this.myScriptElement = document.getElementById("myVideo") as HTMLMediaElement;

        this.activatedRoute.queryParams.subscribe(params => {
            if(params.busqueda && this.initital === 'init'){
                this.searchControl.setValue(params.busqueda)
            }
            this._changeDetectorRef.markForCheck();
        });

        this.initital = 'fin';

        this._programService.ficha.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {

            this.ficha = response.ficha;
            this.tags = response.tags;

            this._changeDetectorRef.markForCheck();
        });

        this._programService.subtitulos.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {

            this.subtitulos = response?.subtitulos || [];
            this.totalResponse = response?.totalSubtitulos || 0;
            let paginas = Math.ceil(this.totalResponse / this.limit);
            this.totalPages = paginas;

            if(this.subtitulos.length){
                this.setCurTimePaginated();
            }

            this.videoUrl = `http://3.18.149.205/assets/videos/${this.ficha.id_programa}/${this.year}/${this.ficha.nombreArchivo}`;
            this._changeDetectorRef.markForCheck();
        });

        this._programService.programa.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.programa = response.programa;
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to the search field value changes
        this.searchControl.valueChanges.pipe(debounceTime(this.debounce),takeUntil(this._unsubscribeAll)).subscribe((value) =>
        {
            if(value !== ''){

                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { busqueda: value }, queryParamsHandling: 'merge'});
                if(!this.loading ){
                    this.subtituloActual = '';
                    this.myScriptElement.pause();
                    this.buscarData();
                }
                this._changeDetectorRef.markForCheck();
            }else{
                this.router.navigate([],{relativeTo: this.activatedRoute,queryParams: { busqueda: null }, queryParamsHandling: 'merge'});
                this.buscarData();
                this._changeDetectorRef.markForCheck();
            }
        });

        // this.fileExists(`assets/videos/${this.ficha.id_programa}/${this.year}/${this.ficha.nombreArchivo}`).subscribe((response:any) => {
        //     if(response === true){
        //         this.videoUrl = `assets/videos/${this.ficha.id_programa}/${this.year}/${this.ficha.nombreArchivo}`;
        //         this.isVideo = true;
        //     }else{
        //         this.videoUrl = 'assets/images/dashboard/thumbnail.png';
        //         this.isVideo = false;
        //     }

        //     this._changeDetectorRef.markForCheck();
        // })
    }

    ngAfterViewInit(): void {
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
        this._programService.getSubTitulosFichaPaginated(page, this.ficha.clavePrincipal, data).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._programService.subtitulos = response;
                this.loading = false;
                // this.myScriptElement.play();
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

        // this.videoPlayer.currentTime = tiempo;
    }

    setCurTimePaginated(){
        let ultimo = this.subtitulos[0].tiempo_Inicio.split(':');
        const horasu = parseInt(ultimo[0]) * 3600;
        const minutosu = parseInt(ultimo[1]) * 60;
        const segundosu = parseFloat(ultimo[2].replaceAll(',','.'));
        const tiempou = horasu + minutosu + segundosu;

        this.myScriptElement.currentTime = tiempou;
        this.myScriptElement.play();
    }

    fileExists(url: string): Observable<boolean> {
        // let headers = new HttpHeaders();
        // headers = headers.set('Access-Control-Allow-Origin', '*');
        // headers = headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // headers = headers.set('Accept', '*/*');
        return this.httpCliente.get(url, {responseType: 'text'})
            .pipe(map(response => {
                    return true;
                }),
                catchError(error => {
                    return of(false);
                })
            );
    }

    descargarFile(){
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
        const temp =  value.replace(regEx, `<strong class="font-bold text-black">${searchValue}</strong>`);
        return temp;
    }

    // trans(){
    //     console.log(1);
    // }
}
