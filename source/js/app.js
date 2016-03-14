define(['bootstrap', 'autocompleteMediator', 'http://www.bbc.co.uk/indepthtoolkit/data-sets/library_closure?callback=define'], function (news, AutocompleteMediator, autocompleteData) {

    var $searchForm = news.$('.mpSearch_form');
    var $searchInput = news.$('#mpSearch_form_input');

    var $result = news.$('.mpSearch_result');
    var $resultVote = news.$('.mpSearch_result_vote');
    var $resultText = news.$('.mpSearch_result_text');

    var getUserData = function () {
        return autocomplete.getSelectedMp();
    };

    var disableButton = function ($button) {
        $button.addClass('mpSearch_form_submit-disabled').attr('disabled', 'disabled');
    };

    var enableButton = function ($button) {
        $button.removeClass('mpSearch_form_submit-disabled').removeAttr('disabled');
    };

    var hideResult = function () {
        $result.hide();
    };

    var showResult = function () {
        $result.show();
    };

    var onMpSelect = function () {
        $searchInput.trigger('blur');
        $searchForm.trigger('submit');
    };

    var dataMissing = function (value) {
        return (value === -99999);
    };

    var getBBCNumber = function (value) {
        var arr = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        return (value < 10) ? arr[value] : value;
    };

    var pluralizeText = function (count, singular, plural) {
        return (count === 1) ? singular: plural;
    };

    var getTotalClosures = function (laName, closures) {
        var html = '<p>';
        html += dataMissing(closures) ? 'No data for closures.': 'In ' + laName + ' since 2010 ' + getBBCNumber(closures) + ' ' + pluralizeText(closures, 'library', 'libraries') + ' and/or mobile ' + pluralizeText(closures, 'library', 'libraries') + ' ' + pluralizeText(closures, 'has', 'have') + ' closed.';
        html += '</p>';
        return html;
    };

    var getTotalPaidStaff = function (staff2010, staffNow) {
        var html = '<p>';
        html += dataMissing(staff2010) ? 'No data for 2010 paid staff. ': 'In 2010 there were ' + getBBCNumber(staff2010) + ' paid staff in libraries, ';
        html += dataMissing(staffNow) ? 'No data for latest staff numbers.' : 'compared with ' + getBBCNumber(staffNow) + ' now.';
        html += '</p>';
        return html;
    };

    var getVolunteerCount = function (volunteers2010, volunteersNow) {
        var html = '<p>';
        html += dataMissing(volunteers2010) ? 'No data was provided for 2010. ' : 'The council had ' + getBBCNumber(volunteers2010) + ' unpaid ' + pluralizeText(volunteers2010, 'volunteer', 'volunteers') + ' in 2010';
        html += dataMissing(volunteersNow) ? ' No latest data was provided.' : ' and has ' + getBBCNumber(volunteersNow) + ' ' + pluralizeText(volunteersNow, 'volunteer', 'volunteers') + ' today.';
        html += '</p>';
        return html;
    };

    var getHmlString = function (userData) {
        var html = '<p>No data on changes in libraries was available for this council.</p>';
        if (userData.data.la_code !== '00QW') {
            html = getTotalClosures(userData.key, userData.data.total_closures);
            html += getTotalPaidStaff(userData.data.paid_staff_2010, userData.data.paid_staff_now);
            html += getVolunteerCount(userData.data.volunteers_2010, userData.data.volunteers_now);
        }
        return html;
    };




    var autocomplete = new AutocompleteMediator($searchInput, onMpSelect, autocompleteData);

    $searchInput.on('focus', function () {
        var $this = $(this);
        if ($this.val() !== '') {
            $this.val('');
            hideResult();
        }
    });

    $searchForm.on('submit', function () {
        if ($searchInput.val() === $searchInput.attr('placeholder')) {
            $searchInput.val('');
        }

        var userData = getUserData();
        if (userData) {
            news.pubsub.emit('user-submitted-data', [userData]);

            news.pubsub.emit('istats', ['data-submitted', 'newsspec-interaction', true]);
            var istats_mpname = 'data-submitted_' + userData.key.replace(/\s+/g, '-').toLowerCase();
            news.pubsub.emit('istats', [istats_mpname, 'newsspec-interaction', true]);
        }
        return false;
    });

    news.pubsub.on('user-submitted-data', function (userData) {
        if (userData) {
            showResult();
            $resultVote.text(userData.key);
            $resultText.html(getHmlString(userData));

        }
    });

    news.pubsub.emit('pageLoaded');
});
