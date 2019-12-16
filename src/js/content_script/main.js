
(function (ctx) {
    const DECORATOR_CLASS = "redmine-decorator";
    const CHANGE_TO_CLOSED_LINK = {
        "class": ["icon", "icon-closed"],
        "text": chrome.i18n.getMessage("closed"),
        "next_sibling_selector": "a.icon.icon-edit"
    };
    const STATUS_CLOSED = 5;
    const API_KEY = "28a16b54caa3f7ba85a2c16e3818275153a5635b";
    // const API_KEY = "4c5454d28911872c291251438ebf333447c9f259";
    const REDMINE_BASE_URL = "http://localhost:3000/";
    const API_HEADER_KEY = "X-Redmine-API-Key";

    var isIssuePage = function (url) {
        if (!url.startsWith(REDMINE_BASE_URL)) {
            return false;
        }

        if (!url.substr(REDMINE_BASE_URL.length).match(/^issues\/[0-9]+/)) {
            return false;
        }

        return true;
    };

    var issueId = function (url) {
        if (!isIssuePage(url)) {
            throw `Invalid URL ${url}`
        }

        var match_data = url.substr(REDMINE_BASE_URL.length).match(/^issues\/([0-9]+)/);
        if (!match_data) {
            throw `Invalid URL ${url}`;
        }

        return parseInt(match_data[1], 10);
    };

    var issueUrl = function (issue_id, format = ".json") {
        return `${REDMINE_BASE_URL}issues/${issue_id}${format}`;
    };

    var canChangeToClosed = function (issue_info) {
        if (!issue_info["assigned_to"]) {
            return false;
        }

        return true;
    };

    var createLink = function (text, class_list) {
        var elem = document.createElement("a");
        elem.href = "#";
        elem.className = class_list.concat(DECORATOR_CLASS).join(" ");
        elem.innerText = text;
        return elem;
    };

    var createChangeToClosedLink = function () {
        return createLink(CHANGE_TO_CLOSED_LINK["text"], CHANGE_TO_CLOSED_LINK["class"]);
    };

    var getCurrentIssueInfo = async function () {
        var url = location.href;
        var issue_id = issueId(url);
        var issue_url = issueUrl(issue_id);
        var headers = {};
        headers[API_HEADER_KEY] = API_KEY;
        var issue_info = await ctx.Misc.getJson(issue_url, headers);
        return issue_info["issue"];
    };

    var changeIssueStatusToClosed = async function () {
        var url = location.href;
        var issue_id = issueId(url);
        var issue_url = issueUrl(issue_id);
        var issue_info = {
            "issue": {
                "status_id": STATUS_CLOSED,
                // "assigned_to_id": 
            }
        };
        var headers = {};
        headers[API_HEADER_KEY] = API_KEY;
        await ctx.Misc.putJson(issue_url, issue_info, headers);
    };

    var reloadPage = function () {
        location.reload(true);
    };

    var eventHandlerForClosedLink = function (event) {
        (async function () {
            try {
                var current_issue_info = await getCurrentIssueInfo();
                if (!canChangeToClosed(current_issue_info)) {
                    alert(chrome.i18n.getMessage("cannot_change_to_closed"));
                    return;
                }

                await changeIssueStatusToClosed();
                var new_issue_info = await getCurrentIssueInfo();
                if (new_issue_info["status"]["id"] != STATUS_CLOSED) {
                    alert(chrome.i18n.getMessage("failed_to_change_to_closed"));
                    return;
                }
            } catch (e) {
                alert(chrome.i18n.getMessage("failed_to_change_to_closed"));
                throw e;
            }

            reloadPage();
        })().catch((error) => console.log(error));
        event.preventDefault();
    };

    var addEventListenerToClosedLink = function (elem) {
        elem.addEventListener("click", eventHandlerForClosedLink);
    };

    var addChangeToClosedLinks = function () {
        var base_elems = Array.from(document.querySelectorAll(CHANGE_TO_CLOSED_LINK["next_sibling_selector"]));
        if (base_elems.length === 0) {
            console.log("No links are found.");
            return;
        }

        base_elems.forEach((base_elem) => {
            var link_elem = createChangeToClosedLink();
            base_elem.parentNode.insertBefore(link_elem, base_elem);
            addEventListenerToClosedLink(link_elem);
        });
    };

    var insertAdditionalLinks = function () {
        addChangeToClosedLinks();
    };

    var removeAdditionalLinks = function () {
        var elems = Array.from(document.querySelectorAll("." + DECORATOR_CLASS));
        elems.forEach(elem => elem.parentNode.removeChild(elem));
    };


    if (isIssuePage(location.href)) {
        removeAdditionalLinks();
        insertAdditionalLinks();
    }
})(RedmineDecorator);
