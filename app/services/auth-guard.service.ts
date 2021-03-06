import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';

import { UsersService } from './users.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _usersService: UsersService,
        private _router: RouterExtensions
    ) {}

    canActivate() {
        return this._usersService.currentUser()
            .then(u => {
                let isLoggedIn = !!u;
                if (!isLoggedIn) {
                    this._router.navigateByUrl('user/login');
                }
                return isLoggedIn;
            });
    }
}
