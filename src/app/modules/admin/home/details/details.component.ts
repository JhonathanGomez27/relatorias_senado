import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Data, Params, Router, RouterLink, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { HomeProgramService } from '../home.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-program-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrl: './detail.component.scss',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterOutlet, RouterLink, NgIf, MatTooltipModule],
})
export class DetailsProgramComponent implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    _year: BehaviorSubject<any> = new BehaviorSubject<any>('');
    yearSelected: string = '';
    programData: any = {};

    disableButton: boolean = false;
    Toast: any;

    image: string = '';

    constructor(
        private route: ActivatedRoute,
        private _programaService: HomeProgramService,
        private router: Router,
        private _changeDetectorRef: ChangeDetectorRef
    ){
        this.Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });
    }

    ngOnInit(): void {
        this._programaService.yearSelected.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
            setTimeout(() => {
                if(value === 'undefined'){
                    value = 'Sin fecha'
                }
                this.yearSelected = value;
                this._year.next('s');
            }, 200);
            this._changeDetectorRef.markForCheck();
        });

        this._programaService.programa.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this.programData = response.programa;
            if(response.programa.imagen !== null && response.programa.imagen !== ''){
                let path = response.programa.imagen;
                let result = path.split("html/")[1];
                this.image = `http://3.18.149.205/${result}`;
            }else{
                this.image = "assets/images/dashboard/thumbnail.png";
            }
            this._changeDetectorRef.markForCheck();
        });
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
    // Subir imagen
    //-----------------------------------
    onFileSelected(event: any){
        this.disableButton = true;

        let fileSelected = event.target.files[0];
        const formData = new FormData();
        formData.append('archivo', fileSelected, fileSelected.name);

        this.subirImagenPrograma(formData);

        this._changeDetectorRef.markForCheck();
    }

    subirImagenPrograma(file: any){
        this._programaService.uploadImageProgram(file, this.programData.clavePrincipal).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this.Toast.fire({
                    icon: 'success',
                    title: 'Imagen de programa actualizada con exito'
                });

                this.actualizarDataPrograma();
                this.disableButton = false;
                this._changeDetectorRef.markForCheck();
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
                this.disableButton = false;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    //-----------------------------------
    // Actualizar data programa
    //-----------------------------------
    actualizarDataPrograma(){
        this._programaService.getDataProgramaUpdate(this.programData.clavePrincipal).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (response:any) => {
                this._programaService.programa = response;
            },(error) => {
                this.Toast.fire({
                    icon: 'error',
                    title: error.error.message
                });
            }
        );
    }

    locationBack(){
        this.router.navigate([this._programaService.routeBack], {relativeTo: this.route});
    }
}
