Everlive.CloudFunction.onRequest(function(request, response, done){
    if (request.action.toUpperCase() !== 'POST') {
        setErrorResponse(response, 'This function only accepts POST requests');
        return done();
    }

    var eventId = request.data.eventId;
    var finalDate = request.data.finalDate;
    if (!eventId || !finalDate) {
        setErrorResponse(response, 'Missing eventId or finalDate in the request body');
        return done();
    }

    var el = Everlive.Sdk.withMasterKey();
    var eventsDb = el.data('Events');
    var regsDb = el.data('EventRegistrations');
    var usersDb = el.data('Users');
    var event;

    eventsDb.getById(eventId)
        .then(function(res) {
            event = res.result;
            if (!event) {
                setErrorResponse(response, 'Event not found');
                return done();
            }
            
            if (request.principal.id !== event.OrganizerId && request.principal.type === 'user') {
                setErrorResponse(response, 'You are not the organizer of this event');
                return done();
            }
            
            var finalDateInEventDateOptions = event.EventDateChoices.filter(function(date) {
                return date.toISOString() === finalDate;
            });

            if (!finalDateInEventDateOptions.length) {
                setErrorResponse(response, 'The selected final date is not in the event date options');
                return done();
            }

            var updObj = {
                $set: { EventDate: finalDate, RegistrationCompleted: true },
                $unset: { EventDateChoices: true }
            };
            return eventsDb.rawUpdate(updObj, { Id: eventId });
        })
        .then(function(res) {
            console.log('updated cout: ' + res.result);
            return regsDb.destroy({ EventId: eventId, Choices: { $ne: finalDate } });
        })
        .then(function(res) {
            console.log(JSON.stringify(res));
            done();
        })
        .catch(function(err) {
            setErrorResponse(response, err);
            done();
        });
});

function setErrorResponse(response, errObj) {
    if (typeof errObj === 'string') {
        errObj = { message: errObj };
    }
    response.result = errObj;
    response.statusCode = 400;
    console.log('err: ' + JSON.stringify(errObj.message || errObj));
}
