/**
 * Created by Jack on 16/6/18.
 */

var blogModelCtrl = angular.module('blogModelCtrl', []);

blogModelCtrl.controller('blogsCtrl', function ($scope, $rootScope, $cookies, $timeout, $state, toastr, blogs, user) {
    user.UserInfo().then(function (resp) {
        $scope.username = resp.data.username;
    }).then(function () {
        $scope.username == $rootScope.Admin ? $scope.add = true: $scope.add = false;
    });
    $rootScope.landing_page = true;
    $scope.blogs = blogs;
    $scope.logout = function () {
        $cookies.remove('SessionToken');
        toastr.success('Success! You have logged out.', $rootScope.message_title);
        $timeout(function () {
            $state.go('blogs.list');
            window.location.reload();
        }, 1500);
    }

});

blogModelCtrl.controller('addblogCtrl', function ($scope, $rootScope, $http, $state, $timeout, $cookies, toastr, user) {
    user.UserInfo().then(function (resp) {
        $scope.username = resp.data.username;
        $scope.UserId = resp.data.objectId;
    }).then(function () {
        $scope.username != $rootScope.Admin && $rootScope.back();
    });
    $rootScope.landing_page = true;
    $scope.submitForm = function (isValid) {
        if (isValid) {
            var acl = {};
            acl[$scope.UserId] = {"read": true, "write": true};
            acl["*"] = {"read": true};
            var req = {
                method: 'POST',
                url: 'https://api.leancloud.cn/1.1/classes/Blog',
                headers: {
                    'X-LC-Id': $rootScope.LeanCloudId,
                    'X-LC-Key': $rootScope.LeanCloudKey,
                    'Content-Type': 'application/json'
                },
                data: {
                    'title': $scope.blog_title,
                    'content': $scope.summernote_text,
                    "ACL": acl
                }
            };
            $http(req).then(function successCallback(resp) {
                toastr.success('Success! You have added a blog.', $rootScope.message_title);
                $scope.blog_objId = resp.data.objectId;
                $scope.blogs.unshift({
                    'title': $scope.blog_title,
                    'content': $scope.summernote_text,
                    'createdAt': resp.data.createdAt,
                    'objectId': resp.data.objectId
                });
                $timeout(function () {
                    $state.go('blogs.detail', {'blogId': $scope.blog_objId});
                }, 1500);
            }, function errorCallback(resp) {
                toastr.error(resp.data.error, $rootScope.message_title);
            })
        }
    };
});

blogModelCtrl.controller('blogCtrl', function ($scope, $rootScope, $stateParams, $http, $state, $cookies, $timeout, toastr, blogs, utils, user) {
    $rootScope.landing_page = true;
    user.UserInfo().then(function (resp) {
        $scope.username = resp.data.username;
    }).then(function () {
        $scope.username == $rootScope.Admin ? $scope.ctrl = true: $scope.ctrl = false;
    });
    $scope.blog = utils.findById($scope.blogs, $stateParams.blogId);
    $scope.blogUrl = 'https://jack614.github.io/#/blogs/' + $stateParams.blogId;
    $scope.delete_blog = function (objectId) {
        $scope.username != $rootScope.Admin && $rootScope.back();
        var req = {
            method: 'DELETE',
            url: 'https://api.leancloud.cn/1.1/classes/Blog/' + objectId,
            headers: {
                'X-LC-Id': $rootScope.LeanCloudId,
                'X-LC-Key': $rootScope.LeanCloudKey,
                'X-LC-Session': $cookies.get('SessionToken'),
                'Content-Type': 'application/json'
            }
        };
        $http(req).then(function successCallback(){
            toastr.success('Success! The blog has been deleted.', $rootScope.message_title);
            $scope.blogs = utils.deletebyId($scope.blogs, objectId);
            $timeout(function () {
                $state.go('blogs.list');
            }, 1500);
        }, function errorCallback(resp) {
            toastr.error(resp.data.error, $rootScope.message_title);
        });
    }
});

blogModelCtrl.controller('editblogCtrl', function ($scope, $rootScope, $stateParams, $cookies, $http, $state, $timeout, toastr, utils, user) {
    user.UserInfo().then(function (resp) {
        $scope.username = resp.data.username;
    }).then(function () {
        $scope.username != $rootScope.Admin && $rootScope.back();
    });
    $rootScope.landing_page = true;
    $scope.blog = utils.findById($scope.blogs, $stateParams.blogId);
    $scope.submitForm = function(isValid) {
        if (isValid) {
            var blog_objectId = $scope.blog.objectId;
            var req = {
                method: 'PUT',
                url: 'https://api.leancloud.cn/1.1/classes/Blog/' + blog_objectId,
                headers: {
                    'X-LC-Id': $rootScope.LeanCloudId,
                    'X-LC-Key': $rootScope.LeanCloudKey,
                    'X-LC-Session': $cookies.get('SessionToken'),
                    'Content-Type': 'application/json'
                },
                data: {
                    'title': $scope.blog.title,
                    'content': $scope.blog.content
                }
            };
            $http(req).then(function successCallback() {
                toastr.success('Success! The blog has been updated.', $rootScope.message_title);
                $scope.blogs = utils.editbyId($scope.blogs, blog_objectId, $scope.blog);
                $timeout(function () {
                    $state.go('blogs.detail', {'blogId': blog_objectId});
                }, 1500);
            }, function errorCallback(resp) {
                toastr.error(resp.data.error, $rootScope.message_title);
            });
        }
    }
});