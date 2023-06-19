'use strict';
app.factory('notificationService', function(toaster) {
    return {
        notify: function() {
            toaster.pop('success', "title", "", 1000);
            toaster.pop('success', "title", "", 5000);
            toaster.pop('error', "title", "");
            toaster.pop('warning', "title", "", 1000);
            toaster.pop('note', "title", "", 1000);
            toaster.pop('success', "title", "", 1500);
        },
        successNotify: function(title, time) {
            toaster.pop('success', title, "", 1000);
        },
        errorNotify: function(title) {
            toaster.pop('error', title, "");
        },
    }
});
