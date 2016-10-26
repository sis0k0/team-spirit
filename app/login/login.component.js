"use strict";
var core_1 = require('@angular/core');
var services_1 = require('../services');
var LoginComponent = (function () {
    function LoginComponent(_usersService) {
        this._usersService = _usersService;
        this.isSignupView = false;
        this.user = {};
    }
    LoginComponent.prototype.changeView = function (signupView) {
        this.user.username = '';
        this.user.password = '';
        this.isSignupView = signupView;
    };
    LoginComponent.prototype.login = function () {
        this._usersService.login(this.user.username, this.user.password)
            .then(function () { return console.log('LOGGED IN'); })
            .catch(function (e) { return console.error(e.message); });
    };
    LoginComponent.prototype.signup = function () {
        var _this = this;
        if (this.user.password !== this.user.confirmPassword) {
            return console.error('Both passwords do not match');
        }
        this._usersService.register(this.user.username, this.user.password)
            .then(function () { return _this.changeView(false); })
            .catch(function (e) { return console.error(e.message); });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login',
            templateUrl: 'login/login.template.html'
        }), 
        __metadata('design:paramtypes', [services_1.UsersService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map