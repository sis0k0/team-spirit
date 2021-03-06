import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page } from 'ui/page';
import { action } from 'ui/dialogs';

import { GroupsService, AlertService, EverliveProvider, UsersService, PlatformService } from '../../services';
import { Group, User, GroupJoinRequest } from '../../shared/models';
import { utilities } from '../../shared';

@Component({
    moduleId: module.id,
    selector: 'group-details',
    templateUrl: './group-details.template.html',
    styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
    group: Group;
    hasJoined: boolean = null;
    members: User[] = [];
    isAndroid: boolean = false;
    iosPopupOpen: boolean = false;
    userApplication: GroupJoinRequest = null;
    private _currentUser: User;
    private _disableJoinBtn: boolean = false;

    constructor(
        private _usersService: UsersService,
        private _activatedRoute: ActivatedRoute,
        private _alertsService: AlertService,
        private _everliveProvider: EverliveProvider,
        private _routerExtensions: RouterExtensions,
        private _platform: PlatformService,
        private _groupsService: GroupsService,
        private _page: Page
    ) {
        this.isAndroid = this._platform.isAndroid;
    }

    ngOnInit() {
        this._page.actionBar.title = '';
        this._activatedRoute.params.subscribe(p => {
            let groupId = p['id'];

            let userPrm = this._usersService.currentUser()
                .then(user => this._currentUser = user);

            let groupPrm = this._groupsService.getById(groupId)
                .then(group => {
                    this.group = group;
                    this._page.actionBar.title = this.group.Name;
                });

            Promise.all<any>([userPrm, groupPrm])
                .then(() => this._groupsService.getGroupMembers(this.group.Id))
                .then(members => this.members = members)
                .then(() => this._groupsService.getApplication(this.group.Id, this._currentUser.Id))
                .then((application) => {
                    this.userApplication = application;
                    this.hasJoined = this.members.some(m => m.Id === this._currentUser.Id);

                    if (!this.userApplication && !this.hasJoined && p['joinRedirect']) {
                        this.onJoin(); // this handles its errors
                    }
                })
                .catch(err => {
                    this._disableJoinBtn = false;
                    this._alertsService.showError(err && err.message);
                });;
        });
    }

    deleteGroup() {
        this._alertsService.askConfirmation(`Delete "${this.group.Name}"?`)
            .then(() => this._groupsService.delete(this.group.Id))
            .then(() => this._alertsService.showSuccess(`Group "${this.group.Name}" deleted!`))
            .then(() => this._routerExtensions.navigate(['/groups']))
            .catch(err => err && this._alertsService.showError(err.message));
    }

    getRemainingText() {
        let remainingCount = Math.max(0, this.members.length - 5);
        if (remainingCount) {
            return `and ${remainingCount} more`;
        }
        return '';
    }

    canEdit() {
        return this.group && this._currentUser && this.group.Owner === this._currentUser.Id;
    }

    onEdit() {
        this._routerExtensions.navigateByUrl(`groups/${this.group.Id}/edit`);
    }

    getJoinBtnText() {
        return this.group.RequiresApproval ? 'Ask to join' : 'Join';
    }

    getDetailsText() {
        let text = `This group is ${this.group.IsPublic ? 'public' : 'private'} and ${this.group.RequiresApproval ? 'requires approval' : 'does not require approval'} to join.`;
        return text;
    }

    onViewEvents() {
        this._routerExtensions.navigate([`groups/${this.group.Id}/events`]);
    }

    onViewRequests() {
        this._alertsService.showError('Not implemented yet. Please follow the development :)');
    }

    onJoin(): Promise<any> {
        if (this._disableJoinBtn) {
            return Promise.resolve(false);
        }

        this._disableJoinBtn = true;
        this._joinGroup().catch((err) => {
            this._disableJoinBtn = false;
            this._alertsService.showError(err && err.message);
        });
    }

    onLeave() {
        this._groupsService.leaveGroup(this.group.Id, this._currentUser.Id)
            .then(() => {
                this.hasJoined = false;
                this.members = this.members.filter(m => m.Id !== this._currentUser.Id);
                this.userApplication = null;
             })
            .catch((err) => {
                this._alertsService.showError(err && err.message);
            });
    }

    onMembersTap() {
        if (this.members.length) {
            this._routerExtensions.navigateByUrl(`/groups/${this.group.Id}/members`);
        }
    }

    onBack() {
        this._routerExtensions.navigateByUrl(`/groups`);
    }

    getApplicationStatusText() {
        let text = 'Pending approval';
        if (this.userApplication && this.userApplication.Resolved) {
            text = 'Membership denied'; // cause if it was approved, they wouldn't see this message
        }
        return text;
    }

    getApplicationStatusIcon() {
        let icon = '68';
        if (this.userApplication && this.userApplication.Resolved) {
            icon = '67';
        }
        return String.fromCharCode(parseInt(icon, 16));
    }

    showJoinBtn() {
        return this.hasJoined === false && !this.userApplication;
    }

    toggleActions() {
        action({
            message: 'What would you like to do?',
            actions: ['Delete Group'],
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result === 'Delete Group') {
                this.deleteGroup();
            }
        });
    }

    showIf(shouldShow: boolean) {
        return utilities.showIf(shouldShow);
    }

    private _addCurrentUserAsRegistered() {
        this.hasJoined = true;
        let clone = this.members.slice(0);
        clone.push(this._currentUser);
        this.members = clone;
    }

    private _joinGroup() {
        return this._groupsService.joinGroup(this.group.Id, this._currentUser.Id)
            .then((resp) => {
                if (this.group.RequiresApproval) {
                    this._alertsService.showSuccess(`Request to join "${this.group.Name}" sent`);
                    this.userApplication = { Approved: false } as any;
                } else {
                    this._addCurrentUserAsRegistered();
                }
                this._disableJoinBtn = false;
                return resp;
            });
    }
}
