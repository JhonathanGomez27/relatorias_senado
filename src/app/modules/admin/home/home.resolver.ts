
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Router } from "@angular/router";
import { HomeProgramService } from "./home.service";
import { inject } from "@angular/core";

export const getProgramsResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let page:any = '1';
    if(route.queryParamMap.has('page')){
       page = route.queryParamMap.get('page');
    }

    return inject(HomeProgramService).getProgramas(page);
}

export const getProgramDataResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let programa:any = '';
    if(route.paramMap.has('programa')){
       programa = route.paramMap.get('programa');
    }

    return inject(HomeProgramService).getDataPrograma(programa);
}

export const getProgramFichasResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let programa:any = '';
    let year: any = '';
    if(route.paramMap.has('programa') && route.paramMap.has('year')){
       programa = route.paramMap.get('programa');
       year = route.paramMap.get('year');
    }

    let page:any = '1';
    if(route.queryParamMap.has('page')){
       page = route.queryParamMap.get('page');
    }

    let data: any = {palabraClave: ''};
    if(route.queryParamMap.has('busqueda')){
        data.palabraClave = route.queryParamMap.get('busqueda') || '';
    }

    return inject(HomeProgramService).getFichasPrograma(programa, year, page, data);
}

export const getFichaDataResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let chapter:any = '';
    if(route.paramMap.has('chapter')){
       chapter = route.paramMap.get('chapter');
    }

    return inject(HomeProgramService).getFichaInfo(chapter);
}

export const getSubtituloFilterProgram: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let ficha:any = '';
    if(route.paramMap.has('chapter')){
       ficha = route.paramMap.get('chapter');
    }

    let data: any = {palabraClave: ''};
    if(route.queryParamMap.has('busqueda')){
        data.palabraClave = route.queryParamMap.get('busqueda') || '';
    }

    return inject(HomeProgramService).getSubTitulosFicha(1, ficha, data);
}
