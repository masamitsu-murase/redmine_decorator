
(function (ctx) {
    var UserSetting = class {
        constructor(redmine_url = "", rest_api_key = "", resolved_status = "", optgroup_label = "", assignee_name = "", closed_status = "") {
            this.redmine_url = redmine_url;
            this.rest_api_key = rest_api_key;
            this.resolved_status = resolved_status;
            this.optgroup_label = optgroup_label;
            this.assignee_name = assignee_name;
            this.closed_status = closed_status;
        }

        save() {
            return new Promise((resolved, rejected) => {
                let obj = {
                    "redmine_url": this.redmine_url,
                    "rest_api_key": this.rest_api_key,
                    "resolved_status": this.resolved_status,
                    "optgroup_label": this.optgroup_label,
                    "assignee_name": this.assignee_name,
                    "closed_status": this.closed_status
                };
                chrome.storage.local.set({ "user_setting": obj }, resolved);
            });
        }
    };
    UserSetting.load = function () {
        return new Promise(function (resolved, rejected) {
            chrome.storage.local.get(["user_setting"], function (obj) {
                if (!obj || !obj.user_setting) {
                    resolved(new UserSetting());
                    return;
                }

                let setting = obj.user_setting;
                resolved(new UserSetting(setting.redmine_url, setting.rest_api_key, setting.resolved_status,
                    setting.optgroup_label, setting.assignee_name, setting.closed_status));
            });
        });
    };

    ctx.UserSetting = UserSetting;
})(RedmineDecorator);
