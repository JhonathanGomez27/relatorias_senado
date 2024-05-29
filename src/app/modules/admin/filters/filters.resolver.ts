import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { FiltersService } from "./filters.service";
import { inject } from "@angular/core";

export const getFiltroByProgramaResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let programa:any = '';
    if(route.paramMap.has('programa')){
       programa = route.paramMap.get('programa');
    }

    let datos:any = {};
    let fichaFiltros: any = {};

    if(route.queryParamMap.has('busqueda')){
        datos.palabraClave = route.queryParamMap.get('busqueda');
    }

    if(route.queryParamMap.has('formato')){
        fichaFiltros.formato = route.queryParamMap.get('formato');
    }

    if(route.queryParamMap.has('tipoArchivoRecibido')){
        fichaFiltros.tipoArchivoRecibido = route.queryParamMap.get('tipoArchivoRecibido');
    }

    if(route.queryParamMap.has('soporteFisicoGrabacion')){
        fichaFiltros.soporteFisicoGrabacion = route.queryParamMap.get('soporteFisicoGrabacion');
    }

    if(route.queryParamMap.has('tipoArchivoGuardado')){
        fichaFiltros.tipoArchivoGuardado = route.queryParamMap.get('tipoArchivoGuardado');
    }

    if(route.queryParamMap.has('resolucion')){
        fichaFiltros.resolucion = route.queryParamMap.get('resolucion');
    }

    datos = {...datos, fichaFiltros}

    return inject(FiltersService).getFiltrosByPrograma(1, datos,programa);
}

export const getProgramaByIdResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let programa:any = '';
    if(route.paramMap.has('programa')){
       programa = route.paramMap.get('programa');
    }

    return inject(FiltersService).getProgramaById(programa);
}

export const getFichaFilter: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let ficha:any = '';
    if(route.paramMap.has('ficha')){
       ficha = route.paramMap.get('ficha');
    }

    return inject(FiltersService).getFichaInfo(ficha);
}

export const getSubtituloFilter: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    let ficha:any = '';
    if(route.paramMap.has('ficha')){
       ficha = route.paramMap.get('ficha');
    }

    let data: any = {palabraClave: ''};
    if(route.queryParamMap.has('busqueda')){
        data.palabraClave = route.queryParamMap.get('busqueda') || '';
    }

    console.log(data);

    return inject(FiltersService).getSubTitulosFicha(1, ficha, data);
}


export const getProgramsFilterResolve: ResolveFn<any> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(FiltersService).getProgramas(1);
}
