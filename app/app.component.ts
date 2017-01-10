import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular/router';
import { RadSideDrawerComponent } from 'nativescript-telerik-ui/sidedrawer/angular';
import * as application from 'application';

import {
    EverliveProvider,
    UsersService,
    EventsService,
    EventRegistrationsService,
    AlertService,
    GroupsService
} from './services';

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
    providers: [EverliveProvider, UsersService, EventsService, EventRegistrationsService, AlertService, GroupsService]
})
export class AppComponent implements OnInit {
    loggedIn: boolean = false;
    @ViewChild('drawer') drawer: RadSideDrawerComponent;

    constructor(
        private usersService: UsersService,
        private routerExtensions: RouterExtensions
    ) { }

    ngOnInit() {
        this.usersService.isLoggedIn().subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.routerExtensions.navigate(['events']);
            } else {
                this.routerExtensions.navigate(['user/login']);
            }

            this.loggedIn = isLoggedIn;
        });

        application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: application.AndroidActivityBackPressedEventData) => {
            if (this.routerExtensions.canGoBack()) {
                args.cancel = true;
                this.routerExtensions.back();
            }
        });
    }

    closeDrawer() {
        this.drawer.sideDrawer.closeDrawer();
    }

    openDrawer() {
        this.drawer.sideDrawer.showDrawer();
    }

    toggleDrawer() {
        if (this.drawer.sideDrawer.getIsOpen()) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    logout() {
        this.usersService.logout();
    }
}
