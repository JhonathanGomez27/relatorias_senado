// import { MatPaginatorIntl } from '@angular/material/paginator';

// export function CustomPaginator() {
//     const customPaginatorIntl = new MatPaginatorIntl();

//     customPaginatorIntl.itemsPerPageLabel = 'Items por página';
//     customPaginatorIntl.nextPageLabel = 'Siguiente pagina';
//     customPaginatorIntl.previousPageLabel = 'Pagina anterior';
//     customPaginatorIntl.firstPageLabel = 'Primer pagina';
//     customPaginatorIntl.lastPageLabel = 'Ultima pagina';

//     return customPaginatorIntl;
// }

import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl implements OnDestroy {

  OF_LABEL = 'of';
  unsubscribe: Subject<void> = new Subject<void>();

  constructor() {
    super();

    this.traducirLabels();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  traducirLabels(){
    this.itemsPerPageLabel = 'Items por página';
    this.nextPageLabel = 'Siguiente pagina';
    this.previousPageLabel = 'Pagina anterior';
    this.OF_LABEL = 'de';
    this.firstPageLabel = 'Primer pagina';
    this.lastPageLabel = 'Ultima pagina';
  }

  getRangeLabel = (page: number, pageSize: number, length: number,) => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.OF_LABEL} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${
      this.OF_LABEL
    } ${length}`;
  };
}
