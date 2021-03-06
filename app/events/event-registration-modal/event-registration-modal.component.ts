import { Component } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { AlertService } from '../../services';
import { utilities } from '../../shared';

@Component({
    moduleId: module.id,
    selector: 'event-registration-modal',
    templateUrl: './event-registration-modal.template.html',
    styleUrls: [ './event-registration-modal.component.css' ]
})
export class EventRegistrationModalComponent {
    availableDates: Array<{ value: Date, isSelected: boolean }>;
    dateFormat = utilities.dateFormat;
    title: string;

    constructor(private _params: ModalDialogParams, private _alertsService: AlertService) {
        this.title = this._params.context.title || 'Registration';
        this.availableDates = this._params.context.availableDates.map((dateAsString: string) => {
            return {
                value: new Date(dateAsString),
                isSelected: false
            };
        });
    }

    onOk() {
        if (this._noDateIsSelected()) {
            return this._alertsService.showError('You need to select at least one date');
        }

        let selectedDates = this.availableDates.map((d, i) => d.isSelected ? i : null).filter(n => n !== null);
        this._params.closeCallback(selectedDates);
    }

    onCancel() {
        this._params.closeCallback();
    }

    private _noDateIsSelected() {
        return this.availableDates.every(d => !d.isSelected);
    }
}
