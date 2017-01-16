import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

import { GroupsService, AlertService, UsersService } from '../../services';
import { Group } from '../../shared/models';

@Component({
    selector: 'groups',
    templateUrl: 'groups/groups/groups.template.html',
    styleUrls: ['groups/groups/groups.component.css']
})
export class GroupsComponent implements OnInit {
    publicGroups: Group[];
    userGroups: Group[];
    initialized: boolean = false;

    constructor(
        private _usersService: UsersService,
        private _groupsService: GroupsService,
        private _routerExtensions: RouterExtensions,
        private _alertService: AlertService
    ) {}
    
    ngOnInit() {
        this._usersService.currentUser()
            .then(u => {
                let unjoinedGroupsPromise = this._groupsService.getUnjoinedGroups(u.Id)
                    .then(res => this.publicGroups = res);
                let userGroupsPromise = this._groupsService.getUserGroups(u.Id)
                    .then(res => this.userGroups = res);
                return Promise.all([unjoinedGroupsPromise, userGroupsPromise]);
            })
            .then(r => this.initialized = true);
    }

    selectGroup(group: Group) {
        this._routerExtensions.navigate([`/groups/${group.Id}`]);
    }

    onAdd() {
        this._routerExtensions.navigateByUrl('/groups/add');
    }
}