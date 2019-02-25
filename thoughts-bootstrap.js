angular.module('thoughts.bootstrap', ['thoughts.bootstrap.ngCombobox']);

angular.module('thoughts.bootstrap.ngCombobox', ['ui.scroll', 'thoughts.bootstrap.ngCombobox.ngComboboxCoreModules', 'thoughts.bootstrap.tpls'])

.controller('ngComboboxController', ['$attrs', '$compile', '$document', '$element', '$filter', '$parse', '$position', '$q', '$rootScope', '$sce', '$scope', '$timeout', '$window', 'ngComboboxGetApiToken', 'ngComboboxGetApiData', 'ngComboboxGetData', 'ngComboboxParams',
function ($attrs, $compile, $document, $element, $filter, $parse, $position, $q, $rootScope, $sce, $scope, $timeout, $window, ngComboboxGetApiToken, ngComboboxGetApiData, ngComboboxGetData, ngComboboxParams) {
    $attrs.$set('role', 'application');

    var $popup;

    var SelectedRow = (function () {
        function SelectedRow() {
            this.index = -1;
            this.item = null;
            this.text = '';
            this.value = null;
        }
        return SelectedRow;
    }());

    var NgCombobox = (function () {
        function NgCombobox(params) {
            var _this = this, _dataSourceType = null, _displayPopupOnSearchEndCallback = false, _events = null, _formattedDataset = null, _lockDataSource = false, _ngModelController = null, _params = null, _popupElement = null, _queryPromise = null, _searchText = null, _visibleFields = null;
            _this.inputText = '';
            _this.isLoading = false;
            _this.isPopup = false;
            _this.selectedRow = new SelectedRow();

            _this.dispose = function () {
                $timeout.cancel(_queryPromise);
                _this.togglePopup(false);
                _popupElement && _popupElement.remove();
            }
            _this.formatText = function (text, type) {
                if (type === 'string' && text != void 0 && typeof text !== 'string') {
                    return String(text);
                } else if (type === 'date') {
                    return $filter('date')(text, 'dd-MMM-yy');
                } else if (type === 'datetime') {
                    return $filter('date')(text, 'dd-MMM-yy hh:mm a');
                }
                return text;
            }
            _this.getDataSource = function () {
                var DataSource = (function () {
                    function DataSource() {
                        this.get = function (index, count, success) {
                            if (angular.isObject(_params)) {
                                var queryPromise = null;
                                if (!_lockDataSource) {
                                    if (_dataSourceType === 1) {
                                        queryPromise = ngComboboxGetData.getData({
                                            dataset: _formattedDataset,
                                            filter: _searchText ? function (item) {
                                                for (var i = 0; i < _visibleFields.length; i++) {
                                                    if (new RegExp(_searchText, 'i').test(item[_visibleFields[i].name])) {
                                                        return true;
                                                    }
                                                }
                                                return false;
                                            } : null,
                                            skip: getSkip(index),
                                            top: getTop(index, count)
                                        });
                                    } else if (_dataSourceType === 2) {
                                        queryPromise = ngComboboxGetApiData.getData({
                                            api: {
                                                uri: _params.parameters.apiUri,
                                                token: ngComboboxGetApiToken.getToken({
                                                    apiTokenUri: ngComboboxGetApiToken.constructApiTokenUri(_params.parameters.apiUri)
                                                })
                                            },
                                            filter: _searchText ? ngComboboxGetApiData.constructFilter(_params.parameters.fields.filter(function (field) {
                                                return field.visible && field.type === 'string';
                                            }).map(function (field, index, arr) {
                                                return {
                                                    columnName: field.name,
                                                    columnType: field.type,
                                                    comparisonOperator: 'contains',
                                                    value: _searchText,
                                                    logicalOperator: (index !== arr.length - 1) ? 'or' : null
                                                };
                                            })) : null,
                                            orderby: _params.parameters.valueField,
                                            select: ngComboboxGetApiData.constructSelect(_params.parameters.fields.map(function (field) {
                                                return field.name;
                                            })),
                                            skip: getSkip(index),
                                            top: getTop(index, count)
                                        });
                                    }
                                }
                                if (queryPromise) {
                                    queryPromise.then(function (data) {
                                        setRowIndex(data, getSkip(index));
                                        updateSelectedRowIndex(data, getSkip(index));
                                        success(data);
                                    }, function (response) {
                                        success([]);
                                    });
                                } else {
                                    success([]);
                                }
                            }
                        }
                    }
                    function getSkip(index) {
                        return index <= 0 ? 0 : index - 1;
                    }
                    function getTop(index, count) {
                        return index < 0 ? index + count - 1 : count;
                    }
                    function setRowIndex(data, startIndex) {
                        for (var i = 0; i < data.length; i++) {
                            data[i].$index = startIndex++;
                        }
                    }
                    function updateSelectedRowIndex(data, startIndex) {
                        if (!isSelectedRowIndexUpdated()) {
                            for (var i = 0; i < data.length; i++) {
                                if (_this.selectedRow.value === data[i][_params.parameters.valueField] && _this.selectedRow.text === getText(data[i])) {
                                    _this.selectedRow.index = startIndex + i;
                                    break;
                                }
                            }
                        }
                    }
                    return DataSource;
                }());

                return new DataSource();
            }
            _this.getEvents = function () {
                return _events;
            }
            _this.getItems = function () {
                var deferred = $q.defer();
                if (_dataSourceType === 1) {
                    deferred.resolve(_params.parameters.dataset);
                } else if (_dataSourceType === 2) {
                    ngComboboxGetApiData.getData({
                        api: {
                            uri: _params.parameters.apiUri,
                            token: ngComboboxGetApiToken.getToken({
                                apiTokenUri: ngComboboxGetApiToken.constructApiTokenUri(_params.parameters.apiUri)
                            })
                        },
                        select: ngComboboxGetApiData.constructSelect(_params.parameters.fields.map(function (field) {
                            return field.name;
                        }))
                    }).then(function (data) {
                        deferred.resolve(data);
                    }, function (response) {
                        deferred.reject(response);
                    });
                } else {
                    deferred.resolve([]);
                }
                return deferred.promise;
            }
            _this.getParameters = function () {
                return _params.parameters;
            }
            _this.getSearchText = function () {
                return _searchText;
            }
            _this.getSelectedIndex = function () {
                return _this.selectedRow.index;
            }
            _this.getSelectedItem = function () {
                return _this.selectedRow.item;
            }
            _this.getSettings = function () {
                return _params.settings;
            }
            _this.getText = function () {
                return _this.selectedRow.text;
            }
            _this.getValue = function () {
                return _this.selectedRow.value;
            }
            _this.getVisibleFields = function () {
                return _visibleFields;
            }
            _this.highlightText = function (text, type, search) {
                var _text = (text !== null && typeof text !== 'string' ? angular.toJson(text) : text);
                if (search && type === 'string') {
                    return $sce.trustAsHtml(_text.replace(new RegExp(search, 'gi'), '<b style="background-color: #ff9460; color: black;">$&</b>'));
                }
                return $sce.trustAsHtml(_text);
            }
            _this.isRowSelected = function () {
                return _this.selectedRow.item !== null;
            }
            _this.onInputTextBlurred = function ($event) {
                $event.stopPropagation();
                if (_this.isRowSelected()) {
                    if (_this.inputText) {
                        _this.inputText = _this.selectedRow.text
                    } else {
                        unselectRow();
                        _events.onSelectedIndexChanged();
                    }
                }
            }
            _this.onInputTextChanged = function () {
                _displayPopupOnSearchEndCallback = true;
                _searchText = _this.inputText;
                _this.selectedRow.index = -1;
                $timeout.cancel(_queryPromise);
                _queryPromise = $timeout(function () {
                    $scope.popupAdapter.reload();
                    _this.togglePopup(_displayPopupOnSearchEndCallback);
                }, 1000, false);
            }
            _this.onInputTextClicked = function () {
                _displayPopupOnSearchEndCallback = !_this.isPopup;
                _this.togglePopup();
            }
            _this.onKeyDown = function ($event) {
                $event.stopPropagation();
                switch ($event.keyCode) {
                    case 38:
                    case 40:
                        var index = ($event.keyCode === 38) ? _this.selectedRow.index - 1 : _this.selectedRow.index + 1;
                        var rowElement = getRowElement(index);
                        if (rowElement) {
                            selectRow(getItem(index));
                            rowElement.scrollIntoViewIfNeeded(false);
                            _events.onSelectedIndexChanged();
                        }
                        break;
                }
            }
            _this.onRowSelected = function (item) {
                $element.find('input').focus();
                _this.togglePopup(false);
                if (_this.selectedRow.index !== item.$index) {
                    selectRow(item);
                    _events.onSelectedIndexChanged();
                }
            }
            _this.onTogglePopupButtonClicked = function () {
                _displayPopupOnSearchEndCallback = !_this.isPopup;
                $element.find('input').focus();
                _this.togglePopup();
            }
            _this.reload = function () {
                $timeout.cancel(_queryPromise);
                _searchText = null;
                unselectRow();
                loadParams($scope.ngCombobox);
                !_lockDataSource && $scope.popupAdapter.reload();
                _events.onReloaded();
            }
            _this.selectRow = function (condition) {
                var queryPromise = null;
                if (_dataSourceType === 1) {
                    queryPromise = ngComboboxGetData.getData({
                        dataset: _formattedDataset,
                        filter: condition,
                        top: 1
                    });
                } else if (_dataSourceType === 2) {
                    queryPromise = ngComboboxGetApiData.getData({
                        api: {
                            uri: _params.parameters.apiUri,
                            token: ngComboboxGetApiToken.getToken({
                                apiTokenUri: ngComboboxGetApiToken.constructApiTokenUri(_params.parameters.apiUri)
                            })
                        },
                        filter: condition,
                        orderby: _params.parameters.valueField,
                        select: ngComboboxGetApiData.constructSelect(_params.parameters.fields.map(function (field) {
                            return field.name;
                        })),
                        top: 1
                    });
                }
                if (queryPromise) {
                    queryPromise.then(function (data) {
                        if (data.length === 1) {
                            selectRow(data[0]);
                        } else {
                            unselectRow();
                        }
                    }, function (response) {
                        unselectRow();
                    });
                } else {
                    unselectRow();
                }
            }
            _this.setNgModelController = function (ngModelController) {
                if (ngModelController !== null) {
                    ngModelController.$render = function () {
                        _this.setValue(ngModelController.$modelValue);
                    }
                    _ngModelController = ngModelController;
                }
            }
            _this.setSelectedIndex = function (index) {
                if (index != void 0) {
                    if (index < 0) {
                        unselectRow();
                    } else if (_this.selectedRow.index != index) {
                        var queryPromise = null;
                        if (_dataSourceType === 1) {
                            queryPromise = ngComboboxGetData.getData({
                                dataset: _formattedDataset,
                                skip: index,
                                top: 1
                            });
                        } else if (_dataSourceType === 2) {
                            queryPromise = ngComboboxGetApiData.getData({
                                api: {
                                    uri: _params.parameters.apiUri,
                                    token: ngComboboxGetApiToken.getToken({
                                        apiTokenUri: ngComboboxGetApiToken.constructApiTokenUri(_params.parameters.apiUri)
                                    })
                                },
                                orderby: _params.parameters.valueField,
                                select: ngComboboxGetApiData.constructSelect(_params.parameters.fields.map(function (field) {
                                    return field.name;
                                })),
                                skip: index,
                                top: 1
                            });
                        }
                        if (queryPromise) {
                            queryPromise.then(function (data) {
                                if (data.length === 1) {
                                    selectRow(angular.extend(data[0], { $index: index }));
                                    //$scope.popupAdapter.reload(index);
                                } else {
                                    unselectRow();
                                }
                            }, function (response) {
                                unselectRow();
                            });
                        } else {
                            unselectRow();
                        }
                    }
                }
            }
            _this.setValue = function (value) {
                if (value === undefined) {
                    _this.setSelectedIndex(-1);
                } else if (_this.selectedRow.value != value) {
                    var queryPromise = null;
                    if (_dataSourceType === 1) {
                        queryPromise = ngComboboxGetData.getData({
                            dataset: _formattedDataset,
                            filter: function (item) {
                                return item[_params.parameters.valueField] == value;
                            },
                            top: 1
                        });
                    } else if (_dataSourceType === 2) {
                        queryPromise = ngComboboxGetApiData.getData({
                            api: {
                                uri: _params.parameters.apiUri,
                                token: ngComboboxGetApiToken.getToken({
                                    apiTokenUri: ngComboboxGetApiToken.constructApiTokenUri(_params.parameters.apiUri)
                                })
                            },
                            filter: ngComboboxGetApiData.constructFilter([{
                                columnName: _params.parameters.valueField,
                                columnType: _params.parameters.valueType,
                                comparisonOperator: 'eq',
                                value: value
                            }]),
                            select: ngComboboxGetApiData.constructSelect(_params.parameters.fields.map(function (field) {
                                return field.name;
                            })),
                            top: 1
                        });
                    }
                    if (queryPromise) {
                        queryPromise.then(function (data) {
                            if (data.length === 1) {
                                selectRow(data[0]);
                            } else {
                                unselectRow();
                            }
                        }, function (response) {
                            unselectRow();
                        });
                    } else {
                        unselectRow();
                    }
                }
            }
            _this.togglePopup = function (display) {
                if (display === undefined) {
                    display = !_this.isPopup;
                }
                if (typeof display === "boolean" && _this.isPopup !== display) {
                    _this.isPopup = display;
                    if (_lockDataSource && _this.isPopup) {
                        _lockDataSource = false;
                        $scope.popupAdapter.reload();
                    }
                    $timeout(function () {
                        positionPopup();
                        if (_this.isPopup) {
                            $document.on('click', documentClicked);
                            angular.element($window).on('resize', positionPopup);
                        } else {
                            $document.off('click', documentClicked);
                            angular.element($window).off('resize', positionPopup);
                        }
                    }, 0, false);
                }
            }
            function documentClicked($event) {
                if (_this.isPopup && !($element[0].contains($event.target) || $popup[0].contains($event.target))) {
                    _displayPopupOnSearchEndCallback = false;
                    $scope.$apply(function () {
                        _this.togglePopup(false);
                    });
                }
            }
            function formatDataset(dataset, fields) {
                var _dataset = [];
                if (dataset.length > 0) {
                    var _fields = [];
                    Object.keys(dataset[0]).forEach(function (key) {
                        var _field = { name: key };
                        for (var i = 0; i < fields.length; i++) {
                            if (fields[i].name === key) {
                                _field.type = fields[i].type;
                            }
                        }
                        _fields.push(_field);
                    });
                    dataset.forEach(function (item) {
                        var _item = {};
                        _fields.forEach(function (field) {
                            _item[field.name] = _this.formatText(item[field.name], field.type);
                        });
                        _dataset.push(_item);
                    });
                }
                return _dataset;
            }
            function getItem(index) {
                var _item = null;
                $scope.popupAdapter.applyUpdates(function (item) {
                    item.$index === index && (_item = item);
                });
                return _item;
            }
            function getPopupElement() {
                _popupElement = _popupElement || angular.element($popup[0].querySelector('.ng-combobox-popup'));
                return _popupElement;
            }
            function getRowElement(index) {
                return $element.next().find('table > tbody [row-index="' + index + '"]')[0];
            }
            function getRowIndex(value) {
                var rowIndex = -1;
                $scope.popupAdapter.applyUpdates(function (item) {
                    item[_params.parameters.valueField] === value && (rowIndex = item.$index);
                });
                return rowIndex;
            }
            function getText(item) {
                var text = '';
                _visibleFields.forEach(function (field, index, arr) {
                    item[field.name] && (text += (item[field.name] ? _this.formatText(item[field.name], field.type) : '') + (arr.length - 1 != index ? '; ' : ''));
                });
                return text;
            }
            function isSelectedRowIndexUpdated() {
                return !(_this.selectedRow.index === -1 && _this.isRowSelected());
            }
            function loadParams(params) {
                _params = patchParams(angular.isFunction(params) ? params() : params);
                if (angular.isArray(_params.parameters.dataset)) {
                    _dataSourceType = 1;
                } else if (_params.parameters.apiUri) {
                    _dataSourceType = 2;
                } else {
                    _dataSourceType = null;
                }
                _visibleFields = _params.parameters.fields.filter(function (field) { return field.visible; });
                if (_dataSourceType === 1) {
                    _formattedDataset = formatDataset(_params.parameters.dataset, _visibleFields);
                    _visibleFields.forEach(function (field) { field.type = 'string'; });
                }
                _events = {
                    onInit: function () {
                        angular.isFunction($scope.onInit) && $scope.onInit();
                        _params.events.onInit(_this);
                    },
                    onReloaded: function () {
                        angular.isFunction($scope.onReloaded) && $scope.onReloaded();
                        _params.events.onReloaded(_this);
                    },
                    onSelectedIndexChanged: function () {
                        angular.isFunction($scope.onSelectedIndexChanged) && $scope.onSelectedIndexChanged();
                        _params.events.onSelectedIndexChanged(_this);
                    },
                    onValueChanged: function () {
                        angular.isFunction($scope.onValueChanged) && $scope.onValueChanged();
                        _params.events.onValueChanged(_this);
                    }
                };
                _lockDataSource = _params.settings.lazyLoading;
            }
            function patchParams(params) {
                if (angular.isObject(params)) {
                    if (angular.isArray(params.parameters.fields)) {
                        var fieldNames = params.parameters.fields.map(function (field) { return field.name; });
                        if (params.parameters.valueField && fieldNames.indexOf(params.parameters.valueField) === -1) {
                            params.parameters.fields.push({
                                name: params.parameters.valueField,
                                type: params.parameters.valueType,
                                visible: false
                            });
                        }
                        if (params.parameters.textField && fieldNames.indexOf(params.parameters.textField) === -1) {
                            params.parameters.fields.push({
                                name: params.parameters.textField,
                                type: 'string',
                                visible: false
                            });
                        }
                        params.parameters.fields.forEach(function (item) {
                            item.type = (item.type != void 0 ? item.type.toLowerCase() : null);
                            item.visible = (item.visible !== false);
                        });
                    } else {
                        params.parameters.fields = [];
                    }
                    params.parameters.valueType = (params.parameters.valueType != void 0 ? params.parameters.valueType.toLowerCase() : null);
                } else {
                    params = new ngComboboxParams();
                }
                return params;
            }
            function positionPopup() {
                var popupElement = getPopupElement();
                if (_this.isPopup) {
                    var position = $position.positionElements($element, popupElement, 'auto bottom-left', $scope.popupAppendToBody);
                    popupElement.css({ top: position.top + 'px', left: position.left + 'px' });
                    popupElement.removeClass('thoughts-position-measure');
                } else {
                    popupElement.addClass('thoughts-position-measure');
                }
            }
            function selectRow(item) {
                unselectRow();
                _this.selectedRow.index = (item.$index !== undefined) ? item.$index : getRowIndex(item[_params.parameters.valueField]);
                _this.selectedRow.item = item;
                _this.selectedRow.text = getText(item);
                _this.selectedRow.value = item[_params.parameters.valueField];
                _this.inputText = _this.selectedRow.text;
                _ngModelController && _ngModelController.$setViewValue(_this.selectedRow.value);
            }
            function unselectRow() {
                _this.inputText = '';
                _this.selectedRow = new SelectedRow();
                _ngModelController && _ngModelController.$setViewValue(_this.selectedRow.value);
            }

            loadParams(params);
        }
        return NgCombobox;
    }());

    this.compile = function () {
        var popupElement = angular.element('<div ng-combobox-popup-content></div>');
        $popup = $compile(popupElement)(angular.extend($scope, {
            name: $attrs.name,
            placeholder: $attrs.placeholder
        }));
        popupElement.remove();
        if ($scope.popupAppendToBody) {
            $document.find('body').append($popup);
        } else {
            $element.after($popup);
        }
    }

    this.initialize = function (ngModelController) {
        $scope.adapter = new NgCombobox($scope.ngCombobox);
        $scope.adapter.setNgModelController(ngModelController);
        $scope.dataSource = $scope.adapter.getDataSource();
        $scope.adapter.getEvents().onInit();
        $scope.$watch($scope.adapter.getValue, function (newValue, oldValue) {
            newValue !== oldValue && $scope.adapter.getEvents().onValueChanged();
        });
        $scope.$on('$destroy', function () {
            $scope.adapter.dispose();
            $popup.remove();
        });
    }
}])

.controller('ngComboboxPopupContentController', ['$scope', '$element', '$attrs', '$compile',
function ($scope, $element, $attrs, $compile) {
}])

.directive('ngCombobox', function () {
    return {
        controller: 'ngComboboxController',
        replace: true,
        require: ['ngCombobox', '?ngModel'],
        restrict: 'AE',
        scope: {
            adapter: '=?',
            ngCombobox: '=',
            ngDisabled: '=?',
            ngRequired: '=?',
            onInit: '&?',
            onReloaded: '&?',
            onSelectedIndexChanged: '&?',
            onValueChanged: '&?',
            popupAppendToBody: '=?'
        },
        templateUrl: function (element, attrs) {
            return 'thoughts/template/ngCombobox/ngCombobox.html';
        },
        transclude: true,
        compile: function (element) {
            return {
                pre: function (scope, element, attrs, controllers) {
                    controllers[0].compile();
                },
                post: function (scope, element, attrs, controllers) {
                    controllers[0].initialize(controllers[1]);
                }
            };
        }
    };
})

.directive('ngComboboxPopupContent', function () {
    return {
        controller: 'ngComboboxPopupContentController',
        replace: true,
        restrict: 'A',
        templateUrl: function (element, attrs) {
            return 'thoughts/template/ngCombobox/ngComboboxPopupContent.html';
        },
        link: function (scope, element, attrs, controller) {
        }
    };
})

.directive('ngComboboxRequired', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            controller.$validators.required = function (modelValue, viewValue) {
                return !scope.ngRequired || scope.adapter.isRowSelected();
            }
            scope.$watchGroup([function () {
                return scope.ngRequired;
            }, function () {
                return scope.adapter.isRowSelected();
            }], function () {
                controller.$validate();
            });
        }
    };
});

angular.module('thoughts.bootstrap.ngCombobox.ngComboboxCoreModules', ['thoughts.bootstrap.position', 'thoughts.bootstrap.ngCombobox.ngComboboxParams', 'thoughts.bootstrap.ngCombobox.ngComboboxGetData', 'thoughts.bootstrap.ngCombobox.ngComboboxGetApiToken', 'thoughts.bootstrap.ngCombobox.ngComboboxGetApiData']);

angular.module('thoughts.bootstrap.position', [])

.factory('$position', ['$document', '$window', function ($document, $window) {
    var SCROLLBAR_WIDTH;
    var BODY_SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
        normal: /(auto|scroll)/,
        hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
        auto: /\s?auto?\s?/i,
        primary: /^(top|bottom|left|right)$/,
        secondary: /^(top|bottom|left|right|center)$/,
        vertical: /^(top|bottom)$/
    };
    var BODY_REGEX = /(HTML|BODY)/;

    return {
        getRawNode: function (elem) {
            return elem.nodeName ? elem : elem[0] || elem;
        },
        parseStyle: function (value) {
            value = parseFloat(value);
            return isFinite(value) ? value : 0;
        },
        offsetParent: function (elem) {
            elem = this.getRawNode(elem);

            var offsetParent = elem.offsetParent || $document[0].documentElement;

            function isStaticPositioned(el) {
                return ($window.getComputedStyle(el).position || 'static') === 'static';
            }

            while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || $document[0].documentElement;
        },
        scrollbarWidth: function (isBody) {
            if (isBody) {
                if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
                    var bodyElem = $document.find('body');
                    bodyElem.addClass('thoughts-position-body-scrollbar-measure');
                    BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                    BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                    bodyElem.removeClass('thoughts-position-body-scrollbar-measure');
                }
                return BODY_SCROLLBAR_WIDTH;
            }

            if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                var scrollElem = angular.element('<div class="thoughts-position-scrollbar-measure"></div>');
                $document.find('body').append(scrollElem);
                SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                scrollElem.remove();
            }

            return SCROLLBAR_WIDTH;
        },
        scrollbarPadding: function (elem) {
            elem = this.getRawNode(elem);

            var elemStyle = $window.getComputedStyle(elem);
            var paddingRight = this.parseStyle(elemStyle.paddingRight);
            var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
            var scrollParent = this.scrollParent(elem, false, true);
            var scrollbarWidth = this.scrollbarWidth(BODY_REGEX.test(scrollParent.tagName));

            return {
                scrollbarWidth: scrollbarWidth,
                widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
                right: paddingRight + scrollbarWidth,
                originalRight: paddingRight,
                heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
                bottom: paddingBottom + scrollbarWidth,
                originalBottom: paddingBottom
            };
        },
        isScrollable: function (elem, includeHidden) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var elemStyle = $window.getComputedStyle(elem);
            return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
        },
        scrollParent: function (elem, includeHidden, includeSelf) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var documentEl = $document[0].documentElement;
            var elemStyle = $window.getComputedStyle(elem);
            if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
                return elem;
            }
            var excludeStatic = elemStyle.position === 'absolute';
            var scrollParent = elem.parentElement || documentEl;

            if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                return documentEl;
            }

            while (scrollParent.parentElement && scrollParent !== documentEl) {
                var spStyle = $window.getComputedStyle(scrollParent);
                if (excludeStatic && spStyle.position !== 'static') {
                    excludeStatic = false;
                }

                if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                    break;
                }
                scrollParent = scrollParent.parentElement;
            }

            return scrollParent;
        },
        position: function (elem, includeMagins) {
            elem = this.getRawNode(elem);

            var elemOffset = this.offset(elem);
            if (includeMagins) {
                var elemStyle = $window.getComputedStyle(elem);
                elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
            }
            var parent = this.offsetParent(elem);
            var parentOffset = { top: 0, left: 0 };

            if (parent !== $document[0].documentElement) {
                parentOffset = this.offset(parent);
                parentOffset.top += parent.clientTop - parent.scrollTop;
                parentOffset.left += parent.clientLeft - parent.scrollLeft;
            }

            return {
                width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
                top: Math.round(elemOffset.top - parentOffset.top),
                left: Math.round(elemOffset.left - parentOffset.left)
            };
        },
        offset: function (elem) {
            elem = this.getRawNode(elem);

            var elemBCR = elem.getBoundingClientRect();
            return {
                width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
            };
        },
        viewportOffset: function (elem, useDocument, includePadding) {
            elem = this.getRawNode(elem);
            includePadding = includePadding !== false ? true : false;

            var elemBCR = elem.getBoundingClientRect();
            var offsetBCR = { top: 0, left: 0, bottom: 0, right: 0 };

            var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
            var offsetParentBCR = offsetParent.getBoundingClientRect();

            offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
            offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
            if (offsetParent === $document[0].documentElement) {
                offsetBCR.top += $window.pageYOffset;
                offsetBCR.left += $window.pageXOffset;
            }
            offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
            offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

            if (includePadding) {
                var offsetParentStyle = $window.getComputedStyle(offsetParent);
                offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
                offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
                offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
                offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
            }

            return {
                top: Math.round(elemBCR.top - offsetBCR.top),
                bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
                left: Math.round(elemBCR.left - offsetBCR.left),
                right: Math.round(offsetBCR.right - elemBCR.right)
            };
        },
        parsePlacement: function (placement) {
            var autoPlace = PLACEMENT_REGEX.auto.test(placement);
            if (autoPlace) {
                placement = placement.replace(PLACEMENT_REGEX.auto, '');
            }

            placement = placement.split('-');

            placement[0] = placement[0] || 'top';
            if (!PLACEMENT_REGEX.primary.test(placement[0])) {
                placement[0] = 'top';
            }

            placement[1] = placement[1] || 'center';
            if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
                placement[1] = 'center';
            }

            if (autoPlace) {
                placement[2] = true;
            } else {
                placement[2] = false;
            }

            return placement;
        },
        positionElements: function (hostElem, targetElem, placement, appendToBody) {
            hostElem = this.getRawNode(hostElem);
            targetElem = this.getRawNode(targetElem);

            var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
            var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

            placement = this.parsePlacement(placement);

            var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
            var targetElemPos = { top: 0, left: 0, placement: '' };

            if (placement[2]) {
                var viewportOffset = this.viewportOffset(hostElem, appendToBody);

                var targetElemStyle = $window.getComputedStyle(targetElem);
                var adjustedSize = {
                    width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
                    height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
                };

                placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                                placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                                placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                                placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                                placement[0];

                placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                                placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                                placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                                placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                                placement[1];

                if (placement[1] === 'center') {
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                        if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                            placement[1] = 'left';
                        } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                            placement[1] = 'right';
                        }
                    } else {
                        var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
                        if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                            placement[1] = 'top';
                        } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                            placement[1] = 'bottom';
                        }
                    }
                }
            }

            switch (placement[0]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top - targetHeight;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left - targetWidth;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width;
                    break;
            }

            switch (placement[1]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                    break;
                case 'center':
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                    } else {
                        targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                    }
                    break;
            }

            targetElemPos.top = Math.round(targetElemPos.top);
            targetElemPos.left = Math.round(targetElemPos.left);
            targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

            return targetElemPos;
        },
        adjustTop: function (placementClasses, containerPosition, initialHeight, currentHeight) {
            if (placementClasses.indexOf('top') !== -1 && initialHeight !== currentHeight) {
                return {
                    top: containerPosition.top - currentHeight + 'px'
                };
            }
        },
        positionArrow: function (elem, placement) {
            elem = this.getRawNode(elem);

            var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
            if (!innerElem) {
                return;
            }

            var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

            var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
            if (!arrowElem) {
                return;
            }

            var arrowCss = {
                top: '',
                bottom: '',
                left: '',
                right: ''
            };

            placement = this.parsePlacement(placement);
            if (placement[1] === 'center') {
                angular.element(arrowElem).css(arrowCss);
                return;
            }

            var borderProp = 'border-' + placement[0] + '-width';
            var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

            var borderRadiusProp = 'border-';
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                borderRadiusProp += placement[0] + '-' + placement[1];
            } else {
                borderRadiusProp += placement[1] + '-' + placement[0];
            }
            borderRadiusProp += '-radius';
            var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

            switch (placement[0]) {
                case 'top':
                    arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'bottom':
                    arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'left':
                    arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'right':
                    arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
                    break;
            }

            arrowCss[placement[1]] = borderRadius;

            angular.element(arrowElem).css(arrowCss);
        }
    };
}]);

angular.module('thoughts.bootstrap.ngCombobox.ngComboboxParams', [])

.service('ngComboboxParams', [function () {
    var Parameters = (function () {
        function Parameters() {
            this.apiUri = null;
            this.dataset = null;
            this.captions = [];
            this.fields = [/*{
                name: 'id',
                type: 'guid',
                visible: false
            }*/];
            this.textField = null;
            this.valueField = null;
            this.valueType = null;
        }
        return Parameters;
    }());

    var Events = (function () {
        function Events() {
            this.onInit = angular.noop;
            this.onReloaded = angular.noop;
            this.onSelectedIndexChanged = angular.noop;
            this.onValueChanged = angular.noop;
        }
        return Events;
    }());

    var Settings = (function () {
        function Settings() {
            this.debugMode = false;
            this.lazyLoading = true;
        }
        return Settings;
    }());

    var NgComboboxParams = (function () {
        function NgComboboxParams(baseParameters, baseEvents, baseSettings) {
            this.parameters = this.parseParameters(baseParameters);
            this.events = this.parseEvents(baseEvents);
            this.settings = this.parseSettings(baseSettings);
        }
        NgComboboxParams.prototype.parseParameters = function (newParameters) {
            if (newParameters == void 0) {
                return new Parameters();
            }
            Object.keys(newParameters).forEach(function (key) {
                if (angular.isFunction(newParameters[key])) {
                    newParameters[key] = newParameters[key]();
                }
            });
            return angular.merge(new Parameters(), newParameters);
        }
        NgComboboxParams.prototype.parseEvents = function (newEvents) {
            if (newEvents == void 0) {
                return new Events();
            }
            Object.keys(newEvents).forEach(function (key) {
                if (angular.isFunction(newEvents[key])) {
                    var event = newEvents[key];
                    newEvents[key] = function (adapter) {
                        event(adapter);
                    }
                }
            });
            return angular.merge(new Events(), newEvents);
        }
        NgComboboxParams.prototype.parseSettings = function (newSettings) {
            if (newSettings == void 0) {
                return new Settings();
            }
            Object.keys(newSettings).forEach(function (key) {
                if (angular.isFunction(newSettings[key])) {
                    newSettings[key] = newSettings[key]();
                }
            });
            return angular.merge(new Settings(), newSettings);
        }
        return NgComboboxParams;
    }());

    return NgComboboxParams;
}]);

angular.module('thoughts.bootstrap.ngCombobox.ngComboboxGetData', [])

.factory('ngComboboxGetData', ['$q', '$filter', function ($q, $filter) {
    var ngComboboxGetData = (function () {
        function ngComboboxGetData() {
        }
        ngComboboxGetData.prototype.getData = function (parameters) {
            var deferred = $q.defer();
            var dataset = parameters.dataset;
            if (angular.isFunction(parameters.filter)) {
                dataset = parameters.dataset.filter(function (item) {
                    return parameters.filter(item);
                });
            }
            if (parameters.skip != void 0) {
                dataset = dataset.slice(parameters.skip);
            }
            if (parameters.top != void 0) {
                dataset = dataset.slice(0, parameters.top);
            }
            deferred.resolve(dataset);
            return deferred.promise;
        }
        return ngComboboxGetData;
    }());

    return new ngComboboxGetData;
}]);

angular.module('thoughts.bootstrap.ngCombobox.ngComboboxGetApiToken', [])

.factory('ngComboboxGetApiToken', ['$http', '$q', '$interval', function ($http, $q, $interval) {
    var ngComboboxGetApiToken = (function () {
        var apiToken = null, promise = null;

        function ngComboboxGetApiToken() {
        }
        ngComboboxGetApiToken.prototype.getToken = function (parameters) {
            if (apiToken == void 0) {
                apiToken = getToken(parameters);
                if (apiToken != void 0) {
                    promise = $interval(function () {
                        apiToken = getRefreshToken(parameters, apiToken);
                    }, (apiToken.expires_in - 20) * 1000, 0, false);
                }
            }
            return apiToken;
        }
        ngComboboxGetApiToken.prototype.constructApiTokenUri = function (apiUri) {
            var uriFragments = apiUri.split('/');
            return uriFragments[0] + '//' + uriFragments[2] + '/token';
        }
        ngComboboxGetApiToken.prototype.dispose = function () {
            $interval.cancel(promise);
            apiToken = null;
        }
        function getToken(parameters) {
            var response = $.ajax({
                async: false,
                method: 'POST',
                url: parameters.apiTokenUri,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    grant_type: 'password',
                    username: 'username',
                    password: 'password'
                }
            });
            return response.status === 200 ? response.responseJSON : null;
        }
        function getRefreshToken(parameters, apiToken) {
            var response = $.ajax({
                async: false,
                method: 'POST',
                url: parameters.apiTokenUri,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: apiToken ? apiToken.refresh_token : ''
                }
            });
            return response.status === 200 ? response.responseJSON : null;
        }
        return ngComboboxGetApiToken;
    }());

    return new ngComboboxGetApiToken;
}]);

angular.module('thoughts.bootstrap.ngCombobox.ngComboboxGetApiData', [])

.factory('ngComboboxGetApiData', ['$http', '$q', function ($http, $q) {
    var ngComboboxGetApiData = (function () {
        function ngComboboxGetApiData(parameters) {
        }
        ngComboboxGetApiData.prototype.getData = function (parameters) {
            var deferred = $q.defer();
            if (isValidParameters(parameters)) {
                $http.get(constructApiUri(parameters), {
                    headers: {
                        'Authorization': parameters.api.token ? 'Bearer ' + parameters.api.token.access_token : ''
                    }
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    deferred.reject(response);
                });
            } else {
                deferred.resolve([]);
            }
            return deferred.promise;
        }
        ngComboboxGetApiData.prototype.constructFilter = function (conditions) {
            var filter = '';
            conditions.forEach(function (condition, index, arr) {
                switch (condition.comparisonOperator) {
                    case 'contains':
                        filter += 'contains(tolower(' + condition.columnName + '), tolower(\'' + condition.value + '\'))';
                        break;
                    default:
                        filter += condition.columnName + ' ' + condition.comparisonOperator + ' ' + (condition.value !== null ? condition.columnType === 'string' ? '\'' + condition.value + '\'' : condition.value : null);
                }
                if (condition.logicalOperator) {
                    filter += ' ' + condition.logicalOperator + (index !== arr.length - 1 ? ' ' : '');
                }
            });
            return filter;
        }
        ngComboboxGetApiData.prototype.constructSelect = function (columnNames) {
            var select = '';
            columnNames.forEach(function (columnName, index, arr) {
                select += columnName + (index !== arr.length - 1 ? ',' : '');
            });
            return select;
        }
        function constructApiUri(parameters) {
            var queryString = '';
            var indexOfQueryString = parameters.api.uri.indexOf('?');
            var hostUri = (indexOfQueryString === -1 ? parameters.api.uri : parameters.api.uri.substring(0, indexOfQueryString));
            var queryStrings = parseQueryString(indexOfQueryString !== -1 ? parameters.api.uri.substring(indexOfQueryString + 1) : null);
            var queryOptions = {
                $filter: queryStrings.hasOwnProperty('$filter') ? (parameters.filter ? queryStrings['$filter'] + ' and (' + parameters.filter + ')' : queryStrings['$filter']) : parameters.filter,
                $orderby: queryStrings.hasOwnProperty('$orderby') ? queryStrings['$orderby'] : parameters.orderby,
                $select: parameters.select,
                $skip: queryStrings.hasOwnProperty('$skip') ? (parameters.skip != void 0 ? queryStrings['$skip'] + parameters.skip : queryStrings['$skip']) : parameters.skip,
                $top: queryStrings.hasOwnProperty('$top') ? queryStrings['$top'] : parameters.top
            };
            angular.extend(queryStrings, queryOptions);
            Object.keys(queryStrings).forEach(function (key) {
                if (queryStrings[key] != void 0) {
                    queryString += (queryString ? '&' : '') + key + '=' + queryStrings[key];
                }
            });
            return hostUri + '?' + queryString;
        }
        function isValidParameters(parameters) {
            return (parameters.top == void 0 || parameters.top > 0) && (parameters.skip == void 0 || parameters.skip >= 0);
        }
        function parseQueryString(queryString) {
            var queryStrings = {};
            if (queryString != void 0) {
                queryString.split('&').forEach(function (part) {
                    var item = part.split('=');
                    var key = item[0].toLowerCase();
                    if (key === '$skip' || key === '$top') {
                        /^\d+$/.test(item[1]) && (queryStrings[key] = Number(item[1]));
                    } else {
                        queryStrings[key] = item[1];
                    }
                });
            }
            return queryStrings;
        }
        return ngComboboxGetApiData;
    }());

    return new ngComboboxGetApiData;
}]);

angular.module('thoughts.bootstrap.tpls', ['thoughts/template/ngCombobox/ngCombobox.html', 'thoughts/template/ngCombobox/ngComboboxPopupContent.html']);

angular.module('thoughts/template/ngCombobox/ngCombobox.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('thoughts/template/ngCombobox/ngCombobox.html',
        "<div class=\"ng-combobox input-group\" ng-keydown=\"adapter.onKeyDown($event)\">\n" +
        "   <input class=\"form-control\" type=\"text\" maxlength=\"800\" name=\"{{::name}}\" placeholder=\"{{::placeholder}}\" ng-model=\"adapter.inputText\" ng-model-options=\"{ allowInvalid: true }\" ng-blur=\"adapter.onInputTextBlurred($event)\" ng-change=\"adapter.onInputTextChanged()\" ng-click=\"adapter.onInputTextClicked()\" ng-combobox-required=\"ngRequired\" ng-disabled=\"ngDisabled\" />\n" +
        "   <ng-transclude></ng-transclude>\n" +
        "   <div class=\"input-group-btn\" ng-switch=\"adapter.isLoading\">\n" +
        "       <button class=\"btn btn-default\" type=\"button\" ng-switch-when=\"false\" ng-click=\"adapter.onTogglePopupButtonClicked()\" ng-disabled=\"ngDisabled\">\n" +
        "           <i class=\"glyphicon glyphicon-search\"></i>\n" +
        "       </button>\n" +
        "       <button class=\"btn btn-default\" type=\"button\" ng-switch-default ng-click=\"adapter.onTogglePopupButtonClicked()\" ng-disabled=\"ngDisabled\">\n" +
        "           <i class=\"glyphicon glyphicon-refresh glyphicon-spin\"></i>\n" +
        "       </button>\n" +
        "   </div>\n" +
        "</div>\n" +
        "");
}]);

angular.module('thoughts/template/ngCombobox/ngComboboxPopupContent.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('thoughts/template/ngCombobox/ngComboboxPopupContent.html',
        "<div>\n" +
        "   <ul role=\"presentation\" class=\"dropdown-menu ng-combobox-popup thoughts-position-measure\">\n" +
        "      <li>\n" +
        "         <div ui-scroll-viewport class=\"ng-combobox\">\n" +
        "             <table>\n" +
        "                 <thead ng-if=\"::adapter.getParameters().captions.length > 0\">\n" +
        "                     <tr>\n" +
        "                         <th ng-repeat=\"caption in ::adapter.getParameters().captions track by $index\">\n" +
        "                             {{::caption}}\n" +
        "                         </th>\n" +
        "                     </tr>\n" +
        "                 </thead>\n" +
        "                 <tbody>\n" +
        "                     <tr ui-scroll=\"item in dataSource\" adapter=\"popupAdapter\" buffer-size=\"30\" is-loading=\"adapter.isLoading\" row-index=\"{{::item.$index}}\" ng-click=\"adapter.onRowSelected(item)\" ng-style=\"item.$index === adapter.selectedRow.index && { 'background-color': '#d3d3d3' }\">\n" +
        "                         <td ng-repeat=\"field in ::adapter.getVisibleFields() track by $index\" style=\"height: 17px;\">\n" +
        "                             <font ng-bind-html=\"adapter.highlightText(adapter.formatText(item[field.name], field.type), field.type, adapter.getSearchText())\"></font>\n" +
        "                         </td>\n" +
        "                     </tr>\n" +
        "                 </tbody>\n" +
        "             </table>\n" +
        "         </div>\n" +
        "      </li>\n" +
        "   </ul>\n" +
        "</div>\n" +
        "");
}]);
