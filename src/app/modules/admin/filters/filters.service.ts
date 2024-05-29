import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class FiltersService {

    // variables url
    private url: string = environment.url;
    private limit: any = environment.pagination;

    // cliente http
    private _httpClient = inject(HttpClient);

    // variables datos
    private _resultados:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _programa:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _programas:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _filtroResultado:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _ficha:  BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _subtitulos:  BehaviorSubject<any | null> = new BehaviorSubject(null);

    //-----------------------------------
    // Getter and setter
    //-----------------------------------

    set programa(data: any){
        this._programa.next(data);
    }

    get programa(): Observable<any>{
        return this._programa.asObservable();
    }

    set programas(data: any){
        this._programas.next(data);
    }

    get programas(): Observable<any>{
        return this._programas.asObservable();
    }

    set filtroResultado(data: any){
        this._filtroResultado.next(data);
    }

    get filtroResultado(): Observable<any>{
        return this._filtroResultado.asObservable();
    }

    set resultados(values: any){
        this._resultados.next(values);
    }

    get resultados(): Observable<any>{
        return this._resultados.asObservable();
    }

    set ficha(values: any){
        this._ficha.next(values);
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

    getDatosFiltroPrograma(page: any, datos:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}programas/filtros`, datos, {params});
    }

    getFiltrosBusqueda(page: any, datos:any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}programas/buscar`, datos, {params});
    }

    getFiltrosByPrograma(page: any, datos:any, programa: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}programas/buscar/${programa}`, datos, {params}).pipe(
            tap((response) => {
                // console.log(response);
                this._filtroResultado.next(response);
            })
        );
    }

    getFiltrosByProgramaPaginated(page: any, datos:any, programa: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', page);
        params = params.set('limit', this.limit);

        return this._httpClient.post(`${this.url}programas/buscar/${programa}`, datos, {params});
    }

    getProgramaById(programa: any): Observable<any> {
        return this._httpClient.get(`${this.url}programas/oneById/${programa}`).pipe(
            tap((response) => {
                // console.log(response);
                this._programa.next(response);
            })
        );
    }

    //-----------------------------------
    // ficha functions
    //-----------------------------------

    getFichaInfo(ficha: any): Observable<any> {
        let params = new HttpParams();
        params = params.set('page', 1);
        params = params.set('limit', this.limit);

        return this._httpClient.get(`${this.url}fichas/oneById/${ficha}`, {params}).pipe(
            tap((response) => {
                this._ficha.next(response);
            })
        );
    }

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
