'use strict';

angular.module('cmp.affiliate')
.directive('affiliateSettings', function(AffiliateSettingsService, $q, $sce, $timeout) {
    return {
        templateUrl: 'components/affiliate/affiliateSettings.html',
        restrict: 'E',
        scope: {
            company: '=',
            viewBag: '=',
        },
        link: function(scope) {
            scope.state = 0;
            scope.submit = submit;
            scope.updateKeys = updateKeys;
            scope.removeKeyValue = removeKeyValue;
            scope.hideSiteId = hideSiteId;
            scope.keyValueExists = exists;

            var watchOff, watchOffKeys = [];
            var hideStatusTimeout = null;
            var hideSiteIdValue = null;

            scope.$watch('company', function() {
                if (!scope.company) { return; }
                if (_.get(scope.company, 'sites')) {
                    watchOffKeys.forEach(function(fn){ fn(); });
                    watchOffKeys = [];
                    hideSiteIdValue = null;

                    scope.primarySites = scope.company.sites.filter(function(site){
                        return site.id===0;
                    });

                    scope.connectedSites = scope.company.sites.filter(function(site){
                        return site.id!==0;
                    });

                    scope.company.sites.forEach(function(site){
                        site.keys.forEach(function(key){
                            $sce.trustAsHtml(key.description);
                            watchOffKeys.push(scope.$watch(function(){
                                return key.value;
                            }, function(){
                                if(scope.viewBag) scope.viewBag.errors[site.id+'.'+key.id] = null;
                                _.findKey(scope.viewBag.errors, function(v){
                                    return v != null;
                                }) == null && (scope.viewBag.error = null);
                            }));
                        })
                    });

                }
            });

            function removeKeyValue(site, key){
                var company = scope.company;
                var p = [];
                scope.state = 1;
                reset();
                if (exists(site.id, key.id)) {
                    p.push(linkAffiliateKey(AffiliateSettingsService.deleteKey(company.id, site.id, key.id)));
                }

                if (p.length) {
                    $q.all(p)
                    .then(handleResponses)
                    .then(function(){
                        removeKeyValueFromUi(site, key);
                    })
                    .then(function(){
                        var p = [];

                        if(hideSiteId()) {
                            scope.connectedSites.forEach(function(site){
                                site.keys.forEach(function(key){
                                    p.push(linkAffiliateKey(AffiliateSettingsService.deleteKey(company.id, site.id, key.id))
                                    .then(function(){
                                        removeKeyValueFromUi(site, key);
                                    }));
                                })
                            });
                        }

                        return $q.all(p);
                    })
                    .then(function(){
                        scope.state = 0;
                        setStatus('success');
                    })
                    .catch(handleError);
                } else {
                    scope.state = 0;
                    removeKeyValueFromUi(site, key);
                }

                function removeKeyValueFromUi(site, key){
                    key.value = '';
                    removePrestineValue(site.id, key.id);
                }
            }

            function updateKeys(site, key){
                if(site.id === 0 && key.required)
                    hideSiteIdValue = null;
            }

            function hideSiteId() {
                if(!scope.primarySites) return true;
                if(hideSiteIdValue == null) {
                    if (_.get(scope.company, 'sites')) {
                        hideSiteIdValue = scope.primarySites
                        .some(function(site){
                            return site.keys.some(function(key){
                                return key.required && !(key.value || '').trim();
                            })
                        });
                    }
                }
                return hideSiteIdValue;
            }

            function linkAffiliateKey(promise, id) {
                return promise.then(function success(res){
                    return res;
                }, function fail(err){
                    err = err || {
                        status: {
                            text: 'Internal error'
                        }
                    };
                    err.id = id;
                    return {
                        err: err
                    };
                });
            }

            function setStatus(status) {
                scope.viewBag.status = status;
                hideStatusTimeout != null && $timeout.cancel(hideStatusTimeout);
                hideStatusTimeout = status != null ? $timeout(function(){
                    scope.viewBag.status = null;
                    hideStatusTimeout = null;
                }, 2000) : null;
            }

            function handleResponses(data) {
                data.forEach(function(res){
                    if(res.err && res.err.id) {
                        scope.errorField = scope.errorField || res.err.id;
                        scope.viewBag.errors[res.err.id] = res.err;
                    }
                });

                if (data.some(function(res){
                    return res.err;
                })) {
                    return $q.reject();
                }
            }

            function handleError(err) {
                scope.state = 0;
                scope.viewBag.error = true;
            }

            function reset() {
                setStatus(null);
                scope.viewBag.error = null;
                scope.viewBag.errorField = null;
                scope.viewBag.errors = {};
            }

            // returns 'new' || 'edit' || 'unchanged'
            function isDirty(siteId, keyId) {
                var o, n;
                o = scope.viewBag.prestineValues[[siteId, keyId].join('.')];
                n = _.find(_.get(_.find(_.get(scope.company,'sites'),{id:siteId}), 'keys'),{id:keyId})
                return _.get(o, 'value') === _.get(n, 'value') ? _.get(n, 'value') && _.get(o, 'encrypted') !== _.get(n, 'encrypted') ? 'edit' : 'unchanged' : _.get(o, 'value') == null ? 'new' : 'edit';
            };

            function exists(siteId, keyId) {
                var original = scope.viewBag.prestineValues[[siteId, keyId].join('.')];
                return !!_.get(original, 'value');
            }

            function removePrestineValue(siteId, keyId) {
                var prestineKey = [siteId, keyId].join('.');
                if(scope.viewBag.prestineValues[prestineKey]) {
                    scope.viewBag.prestineValues[prestineKey].value = '';
                }
                hideSiteIdValue = null;
            }

            function submit() {
                var form = scope.affiliateForm;
                var company = scope.company;
                var p = [];

                if (form.$valid && form.$dirty ) {
                    scope.state = 1;
                    reset();

                    angular.forEach(company.sites, function(site) {
                        angular.forEach(site.keys, function(key){
                            var state = isDirty(site.id, key.id);
                            if (state === 'new') {
                                p.push(linkAffiliateKey(AffiliateSettingsService.createKey(company.id, site.id, key.id, key.value, key.encrypted),site.id+'.'+key.id));
                            } else if (state === 'edit') {
                                p.push(linkAffiliateKey(AffiliateSettingsService.updateKey(company.id, site.id, key.id, key.value, key.encrypted),site.id+'.'+key.id));
                            }
                        })
                    });

                    if (p.length) {
                        $q.all(p)
                        .then(handleResponses)
                        .then(function(){
                            setStatus('success');
                            scope.$parent.updateViewBag();
                            scope.state = 0;
                        })
                        .catch(handleError);
                    } else {
                        scope.state = 0;
                    }

                }   
            }

        }
    };
});
