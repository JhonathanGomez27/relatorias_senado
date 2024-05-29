import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class HomeComponent{

    drawerMode:any = 'over';
    drawerOpened: any = false;

    constructor(){

    }

    //-----------------------------------
    // Drawer functions
    //-----------------------------------

    /**
     * Toggle the drawer open
     */
    toggleDrawerOpen(): void
    {
        this.drawerOpened = !this.drawerOpened;
    }

    /**
     * Drawer opened changed
     *
     * @param opened
     */
    drawerOpenedChanged(opened: boolean): void
    {
        this.drawerOpened = opened;
    }
}
