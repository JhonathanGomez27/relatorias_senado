import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class HomeProgramService {

    // variables url
    private url: string = environment.url;
    private limit: any = environment.pagination;

    // variables navegacion
    private _routeBack: string = '';
    private _yearSelected: Subject<string> = new Subject<string>();

    // cliente http
    private _httpClient = inject(HttpClient);

    // variables datos
    private _programas:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _programa:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _fichas:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _ficha:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _subtitulos:  BehaviorSubject<any | null> = new BehaviorSubject(null);

    //-----------------------------------
    // Getter and setter
    //-----------------------------------

    set routeBack(ruta: string){
        this._routeBack = ruta;
    }

    get routeBack(): string{
        return this._routeBack;
    }

    set yearSelected(year: string){
        this._yearSelected.next(year);
    }

    get yearSelected(): Observable<string>{
        return this._yearSelected.asObservable();
    }

    set programas(data: any){
        this._programas.next(data);
    }

    get programas(): Observable<string>{
        return this._programas.asObservable();
    }

    set programa(data: any){
        this._programa.next(data);
    }

    get programa(): Observable<string>{
        return this._programa.asObservable();
    }

    set fichas(data: any){
        this._fichas.next(data);
    }

    get fichas(): Observable<string>{
        return this._fichas.asObservable();
    }

    get ficha(): Observable<string>{
        return this._ficha.asObservable();
    }

    set subtitulos(values: any){
        this._subtitulos.next(values);
    }

    get subtitulos(): Observable<string>{
        return this._subtitulos.asObservable();
    }

    //-----------------------------------
    // programas
    //-----------------------------------
    getProgramas(page: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        params = params.set('orden', 'ASC');

        return this._httpClient.get(`${this.url}programas/paginados`, {params}).pipe(
            tap((response) => {
                // console.log(response);
                this._programas.next(response);
            })
        );
    }

    getProgramasOrdenados(page: any, orden: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        params = params.set('orden', orden);

        return this._httpClient.get(`${this.url}programas/paginados`, {params}).pipe(
            tap((response) => {
                // console.log(response);
                this._programas.next(response);
            })
        );
    }

    getDataPrograma(programa: any): Observable<any> {
        return this._httpClient.get(`${this.url}programas/oneById/${programa}`).pipe(
            tap((response) => {
                // console.log(response);
                this._programa.next(response);
            })
        );
    }

    getDataProgramaUpdate(programa: any): Observable<any> {
        return this._httpClient.get(`${this.url}programas/oneById/${programa}`);
    }

    getFichasPrograma(programa: any, anio:any, page:any, data: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        params = params.set('criterioOrden', 'alfabetico');
        params = params.set('orden', 'ASC');

        return this._httpClient.post(`${this.url}programas/fichasByProgramaYAnio/${programa}/${anio}`, data, {params}).pipe(
            tap((response) => {
                // console.log(response);
                this._fichas.next(response);
            })
        );
    }

    getFichasProgramaPaginated(programa: any, anio:any, page:any, criterio: string, orden: string, data:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);
        params = params.set('criterioOrden', criterio);
        params = params.set('orden', orden);

        return this._httpClient.post(`${this.url}programas/fichasByProgramaYAnio/${programa}/${anio}`, data, {params});
    }

    getFichaInfo(ficha: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', 1);
        params = params.set('limit', this.limit);

        return this._httpClient.get(`${this.url}fichas/oneById/${ficha}`, {params}).pipe(
            tap((response) => {
                // console.log(response);
                this._ficha.next(response);
            })
        );
    }

    uploadImageProgram(file:any, programa: any): Observable<any> {
        return this._httpClient.post(`${this.url}programas/subir-imagen/${programa}`, file);
    }

    // obtenerTorneosRefresh(): Observable<any> {
    //     return this._httpClient.get(`${this.url}torneos`);
    // }

    getSubTitulosFicha(page:any, ficha: any, datos:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}fichas/buscar/${ficha}`, datos, {params}).pipe(
            tap((response) => {
                this._subtitulos.next(response);
            })
        );
    }

    getSubTitulosFichaPaginated(page:any, ficha: any, datos:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}fichas/buscar/${ficha}`, datos, {params})
    }
}
