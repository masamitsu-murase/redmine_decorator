
(function (ctx) {
    var $ = x => document.querySelector(x);
    const CHANGED_CLASS = "changed";

    window.addEventListener("load", function () {
        (async function () {
            var setting = null;

            $("#setting").addEventListener("submit", function (event) {
                event.preventDefault();
                (async function () {
                    setting = new ctx.UserSetting($("#redmine_url").value, $("#rest_api_key").value, $("#resolved_status").value,
                        $("#optgroup_label").value, $("#assignee_name").value, $("#closed_status").value);
                    await setting.save();
                    $("#submit").classList.remove(CHANGED_CLASS);
                })().catch(e => console.log(e));
            });


            setting = await ctx.UserSetting.load();
            let attr_names = ["redmine_url", "rest_api_key", "resolved_status", "optgroup_label", "assignee_name", "closed_status"];
            attr_names.forEach(name => $(`#${name}`).value = setting[name]);

            let onchange = () => {
                if (attr_names.every(name => $(`#${name}`).value == setting[name])) {
                    $("#submit").classList.remove(CHANGED_CLASS);
                } else {
                    $("#submit").classList.add(CHANGED_CLASS);
                }
            };
            attr_names.forEach(name => $(`#${name}`).addEventListener("change", onchange));
            attr_names.forEach(name => $(`#${name}`).addEventListener("keyup", onchange));
        })().catch(e => console.log(e));
    });
})(RedmineDecorator);
