import { normalizeArray, dateTimeObjectFrom } from 'c/utilsPrivate';
import SchedulerEvent from './avonniEvent';

/**
 * Create an event.
 *
 * @param {object} event The object describing the event to create.
 */
function createEvent(event) {
    const computedEvent = { ...event };
    this.updateEventDefaults(computedEvent);
    this.computedEvents.push(new SchedulerEvent(computedEvent));
    this.initResources();
}

/**
 * Delete an event.
 *
 * @param {string} eventName Unique name of the event to delete.
 */
function deleteEvent(eventName) {
    const name = eventName || this.selection.event.name;

    // Delete the event
    const index = this.computedEvents.findIndex((evt) => {
        return evt.name === name;
    });
    this.computedEvents.splice(index, 1);
    this.initResources();

    /**
     * The event fired when a user deletes an event.
     *
     * @event
     * @name eventdelete
     * @param {string} name Unique name of the deleted event.
     * @public
     * @bubbles
     */
    this.dispatchEvent(
        new CustomEvent('eventdelete', {
            detail: {
                name
            },
            bubbles: true
        })
    );

    this.selection = undefined;
    this.cleanDraggedElement();
    this.hideAllPopovers();
}

/**
 * Set the focus on an event.
 *
 * @param {string} eventName Unique name of the event to focus.
 */
function focusEvent(eventName) {
    const event = this.template.querySelector(
        `[data-element-id="avonni-primitive-scheduler-event-occurrence"][data-event-name="${eventName}"]`
    );
    if (event) {
        event.focus();
    }
}

/**
 * Display a new event on the schedule grid and open the edition dialog if showDialog is true.
 *
 * @param {number} x Horizontal position of the event in the schedule, in pixels.
 * @param {number} y Vertical position of the event in the schedule, in pixels.
 * @param {boolean} showDialog If true, the edit dialog will be opened. Defaults to true.
 */
function newEvent(x, y, showDialog = true) {
    const resourceAxisPosition = this.isVertical ? y : x;
    const headersAxisPosition = this.isVertical ? x : y;

    this.hideDetailPopover();
    this.hideEditDialog();

    let resourceNames, from, to;
    if (!isNaN(resourceAxisPosition) && !isNaN(headersAxisPosition)) {
        const resource =
            this.getResourceElementFromPosition(headersAxisPosition);
        const cell = this.getCellFromPosition(resource, resourceAxisPosition);
        resourceNames = [resource.dataset.name];
        from = Number(cell.dataset.start);
        to = Number(cell.dataset.end) + 1;
    } else {
        resourceNames = [this.computedResources[0].name];
        from = this.smallestHeader.cells[0].start;
        to = this.smallestHeader.cells[0].end + 1;
    }

    const event = {
        resourceNames,
        title: this.dialogLabels.newEventTitle,
        from,
        to
    };
    this.updateEventDefaults(event);
    const computedEvent = new SchedulerEvent(event);
    this.selection = {
        event: computedEvent,
        occurrences: computedEvent.occurrences,
        occurrence: computedEvent.occurrences[0],
        draftValues: {},
        x,
        y,
        newEvent: true
    };

    if (showDialog) {
        this.computedEvents.push(computedEvent);
        this.showEditDialog = true;
    }
}

/**
 * Save the current changes made to the currently selected event.
 */
function saveEvent() {
    const { event, draftValues } = this.selection;

    // Update the event with the new values
    Object.entries(draftValues).forEach((entry) => {
        const [key, value] = entry;

        if (value.length || key === 'allDay') {
            event[key] = value;
        }
    });

    if (this.selection.newEvent) {
        // Generate a name for the new event, based on its title
        const lowerCaseName = event.title.toLowerCase();
        event.name = lowerCaseName.replace(/\s/g, '-').concat(event.key);

        /**
         * The event fired when a user creates an event.
         *
         * @event
         * @name eventcreate
         * @param {object} event The event created.
         * @public
         * @bubbles
         */
        this.dispatchEvent(
            new CustomEvent('eventcreate', {
                detail: {
                    event: {
                        from: event.from.toUTC().toISO(),
                        resourceNames: event.resourceNames,
                        name: event.name,
                        title: event.title,
                        to: event.to.toUTC().toISO()
                    }
                },
                bubbles: true
            })
        );
        this.selection = undefined;
    } else {
        this.dispatchChangeEvent(event.name);
    }

    event.initOccurrences();
    this.computedEvents = [...this.computedEvents];
}

/**
 * Save the current changes made to the currently selected event occurrence.
 */
function saveOccurrence() {
    const { event, occurrences, occurrence, draftValues } = this.selection;
    const draftResourceNames = normalizeArray(draftValues.resourceNames);
    const resourceNames = draftResourceNames.length
        ? draftResourceNames
        : occurrence.resourceNames;
    const processedResourceNames = [...resourceNames];
    const newOccurrences = [];

    occurrences.forEach((occ) => {
        const resourceName = processedResourceNames.indexOf(occ.resourceName);
        if (resourceName > -1) {
            // If the occurrence resource name is still included in the resource names,
            // update the occurrence with the new values
            Object.entries(draftValues).forEach((entry) => {
                const [key, value] = entry;

                if (value.length || key === 'allDay') {
                    if (key === 'from' || key === 'to') {
                        // Convert the ISO dates into DateTime objects
                        occ[key] = dateTimeObjectFrom(value);
                    } else {
                        occ[key] = value;
                    }
                }
            });
            occ.resourceNames = resourceNames;
            newOccurrences.push(occ);

            // Remove the processed key field from the list
            processedResourceNames.splice(resourceName, 1);
        } else {
            // If the occurrence resource key has been removed,
            // remove it from the event as well
            event.removeOccurrence(occ.key);
        }
    });

    // The resource names left are new ones added by the user
    processedResourceNames.forEach((resourceName) => {
        const occ = Object.assign({}, newOccurrences[0] || occurrences[0]);
        occ.resourceName = resourceName;
        occ.key = `${event.name}-${resourceName}-${
            event.occurrences.length + 1
        }`;
        occ.resourceNames = resourceNames;
        event.occurrences.push(occ);
    });

    this.dispatchChangeEvent(event.name, true);
    this.computedEvents = [...this.computedEvents];
}

/**
 * Bind the event CRUD functions to an execution context.
 *
 * @param {object} context The object that will be used as an execution context.
 */
export function eventCrudMethods(context) {
    return {
        createEvent: createEvent.bind(context),
        deleteEvent: deleteEvent.bind(context),
        focusEvent: focusEvent.bind(context),
        newEvent: newEvent.bind(context),
        saveEvent: saveEvent.bind(context),
        saveOccurrence: saveOccurrence.bind(context)
    };
}
