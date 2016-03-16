define(['bootstrap', 'postcodeMediator', 'autocompleteMediator', 'http://www.bbc.co.uk/indepthtoolkit/data-sets/my_mps_stance_on_eu?callback=define'], function (news, postcoder, AutocompleteMediator, autocompleteData) {

    var $searchForm = news.$('.mpSearch_form');
    var $searchInput = news.$('#mpSearch_form_input');

    var $result = news.$('.mpSearch_result');
    var $resultVote = news.$('.mpSearch_result_vote');
    var $resultText = news.$('.mpSearch_result_text');
    var autocomplete = false;

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
        var arr = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        return (value < 10) ? arr[value] : value;
    };

    var pluralizeText = function (count, singular, plural) {
        return (count === 1) ? singular: plural;
    };

    var capitalizeFirstLetter = function (str) {
        str = str + '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    var getTotalClosures = function (laName, closures) {
        var html = '<p>',
            library = pluralizeText(closures, ' library ', ' libraries '),
            hasHave = pluralizeText(closures, 'has', 'have'),
            closedStr = dataMissing(closures) ? 'No data was available on how many' : getBBCNumber(closures);

        html += capitalizeFirstLetter(closedStr);
        html += library + 'and/or mobile' + library + hasHave + ' closed in ' + laName + ' since the start of the decade.';
        html += '</p>';
        return html;
    };

    var getTotalPaidStaff = function (staff2010, staffNow) {
        var html = '<p>',
            staffStr = dataMissing(staff2010) ? 'No data was available on how many': getBBCNumber(staff2010);

        html += capitalizeFirstLetter(staffStr);
        html += ' paid staff worked for the council in its libraries in 2010 and ';
        html += dataMissing(staffNow) ? 'no data was available on how many' : getBBCNumber(staffNow);
        html += ' work in them today.';
        html += '</p>';
        return html;
    };

    var getVolunteerCount = function (volunteers2010, volunteersNow) {
        var html = '<p>',
            volunteersStr = dataMissing(volunteers2010) ? 'No data was available on how many' : getBBCNumber(volunteers2010);
        
        html += capitalizeFirstLetter(volunteersStr);
        html += ' unpaid ' + pluralizeText(volunteers2010, 'volunteer', 'volunteers') + ' helped out six years ago while ';
        html += dataMissing(volunteersNow) ? 'no data was available on how many' : getBBCNumber(volunteersNow);
        html += ' do so now.';
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

    var performPostcodeSearch = function (postcode) {
        // Postcodes in the UK - https://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom
        postcode = postcoder.sanitise(postcode);
        var datafile = ['/news/special/2016/newsspec_13873_data/postcode', 'constituency', postcoder.getOutwardCode(postcode), postcoder.getInwardCode(postcode) + '.json?callback=define'].join('/');
        
        require(
            [datafile],
            function (data) {
                //load dataset
                var postcodeData = setupPostcodeData();
                console.log(postcodeData);
                console.log(postcodeData[data.code]);
            },
            function (err) {
                //handle error
                console.dir(err);
            }
        );
    };

    var setupPostcodeData = function () {
        var postcodeData = {};
        for (var dataKey in autocompleteData) {
            // console.log(dataKey);
            postcodeData[autocompleteData[dataKey].ons_id] = autocompleteData[dataKey];
        }
        return postcodeData;
    };

    var performTextSearch = function () {
        console.log('text search');
        var userData = getUserData();

        if (userData) {
            news.pubsub.emit('user-submitted-data', [userData]);

            news.pubsub.emit('istats', ['data-submitted', 'newsspec-interaction', true]);
            var istats_mpname = 'data-submitted_' + userData.key.replace(/\s+/g, '-').toLowerCase();
            news.pubsub.emit('istats', [istats_mpname, 'newsspec-interaction', true]);
        }
    };




    // var autocomplete = new AutocompleteMediator($searchInput, onMpSelect, autocompleteData);

    $searchInput.on('focus', function () {
        var $this = $(this);
        if ($this.val() !== '') {
            $this.val('');
            hideResult();
        }
    });

    $searchInput.on('keyup', function () {
        var postcode = postcoder.sanitise($searchInput.val());
        if (postcode.length > 2 && !postcoder.resemblesPostcode(postcode) && !autocomplete) {
            console.log('this is a text search');
            autocomplete = new AutocompleteMediator($searchInput, onMpSelect, autocompleteData);
        }
    });

    $searchForm.on('submit', function () {
        var searchTerm = postcoder.sanitise($searchInput.val());

        if (searchTerm === $searchInput.attr('placeholder')) {
            $searchInput.val('');
            return false;
        }

        if (searchTerm.length < 8 && postcoder.resemblesPostcode(searchTerm)) {
            performPostcodeSearch($searchInput.val());
        } else {
            performTextSearch();
        }

        

        // require dataset
        // dataset base url - /news/special/2016/newsspec_13873_data/postcode/constituency




        // var userData = getUserData();
        // if (userData) {
        //     news.pubsub.emit('user-submitted-data', [userData]);

        //     news.pubsub.emit('istats', ['data-submitted', 'newsspec-interaction', true]);
        //     var istats_mpname = 'data-submitted_' + userData.key.replace(/\s+/g, '-').toLowerCase();
        //     news.pubsub.emit('istats', [istats_mpname, 'newsspec-interaction', true]);
        // }
        return false;
    });

    news.pubsub.on('user-submitted-data', function (userData) {
        if (userData) {
            showResult();
            console.log(userData);
            
            // $resultVote.text(userData.key);
            // $resultText.html(getHmlString(userData));

        }
    });

    news.pubsub.emit('pageLoaded');
});
