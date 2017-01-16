import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../../shared/models';
import { utilities } from '../../shared';

@Component({
    selector: 'event-list',
    templateUrl: 'events/event-list/event-list.template.html',
    styleUrls: ['events/event-list/event-list.component.css']
})
export class EventListComponent {
    dateFormat: string = utilities.dateFormat;
    
    @Input() events: Event[];
    @Output() onEventTap: EventEmitter<any> = new EventEmitter<any>();

    eventTap(event: Event) {
        this.onEventTap.emit(event);
    }

    getEventDate(event: Event) {
        let date: Date = null;

        if (event.EventDate) {
            date = new Date(event.EventDate);
        }

        return date;
    }

    getRemainingTime(event: Event) {
        let oneDay = 24 * 60 * 60 * 1000;
        let eventDate = this.getEventDate(event);

        if (!eventDate) {
            return 'TBD';
        }

        let days = Math.round((eventDate.getTime() - Date.now()) / oneDay);

        if (days > 0) {
            return days + ' days left';
        } else if (days < 0) {
            return Math.abs(days) + ' Days ago';
        } else {
            return 'TODAY';
        }
    }
}
