define(['bootstrap', 'lib/vendors/autocomplete'], function (news) {
    var AutocompleteMediator = function ($inputElement, onMpSelect, mpData) {
        this.$autocompleteInput = $inputElement;
        this.onMpSelect = onMpSelect;
        this.autocompleteSelectedMp = null;
        this.istatsSent = false;
        this.$searchForm = news.$('.mpSearch_form');

        this.mpData = mpData;
        
        this.setupAutocomplete();
        
    };

    AutocompleteMediator.prototype = {
        setupAutocomplete: function () {
            var self = this;

            this.$autocompleteInput.autocomplete({
                lookup: this.getAutocompleteData(),
                lookupLimit: 20,
                autoSelectFirst: true,
                onSelect: function (suggestion) {
                    if (suggestion.mp !== self.autocompleteSelectedMp) {
                        self.autocompleteSelectedMp = suggestion.mp;
                    }
                    self.onMpSelect();
                },
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    if (suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1) {
                        return true;
                    }
                },
                onInvalidateSelection: function () {
                    self.autocompleteSelectedMp = null;
                }
            });
        },
        getAutocompleteData: function () {
            // console.log('this.mpData = ', this.mpData);
            var autocompleteObject = [];
            for (var mpKey in this.mpData) {
                autocompleteObject.push({
                    value: mpKey,
                    mp: {
                        key: mpKey,
                        data: this.mpData[mpKey]
                    }
                });
            }
            return autocompleteObject;
        },
        getSelectedMp: function () {
            return this.autocompleteSelectedMp;
        }
    };

    return AutocompleteMediator;
});