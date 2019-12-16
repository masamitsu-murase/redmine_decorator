
(function (ctx) {
    const DECORATOR_CLASS = "murase-redmine-decorator";
    const CHANGE_TO_CLOSED_LINK = {
        "class": ["icon", "icon-closed"],
        "text": chrome.i18n.getMessage("closed"),
        "next_sibling_selector": "a.icon.icon-edit"
    };
    const STATUS_RESOLVED = 3;
    const STATUS_CLOSED = 5;
    const STATUS_SELECT_ID = "issue_status_id";
    const ASSIGNEE_SELECT_ID = "issue_assigned_to_id";
    const ASSIGNEE_OPTGROUP_LABEL = "企画部";
    const ASSIGNEE_FOR_RESOLVED = "末永 文";
    const API_KEY = "fafd1a57c06bf5d9ea2643c33f692e656316f34f";
    const REDMINE_BASE_URL = "https://demo.lychee-redmine.jp/";
    const API_HEADER_KEY = "X-Redmine-API-Key";

    let isIssuePage = function (url) {
        if (!url.startsWith(REDMINE_BASE_URL)) {
            return false;
        }

        if (!url.substr(REDMINE_BASE_URL.length).match(/^issues\/[0-9]+\/?$/)) {
            return false;
        }

        return true;
    };

    let issueId = function (url) {
        if (!isIssuePage(url)) {
            throw `Invalid URL ${url}`
        }

        let match_data = url.substr(REDMINE_BASE_URL.length).match(/^issues\/([0-9]+)/);
        if (!match_data) {
            throw `Invalid URL ${url}`;
        }

        return parseInt(match_data[1], 10);
    };

    let issueUrl = function (issue_id, format = ".json") {
        return `${REDMINE_BASE_URL}issues/${issue_id}${format}`;
    };

    let canChangeToClosed = function (issue_info) {
        if (!issue_info["assigned_to"]) {
            return false;
        }

        return true;
    };

    let createLink = function (text, class_list) {
        let elem = document.createElement("a");
        elem.href = "#";
        elem.className = class_list.concat(DECORATOR_CLASS).join(" ");
        elem.innerText = text;
        return elem;
    };

    let createChangeToClosedLink = function () {
        return createLink(CHANGE_TO_CLOSED_LINK["text"], CHANGE_TO_CLOSED_LINK["class"]);
    };

    let getCurrentIssueInfo = async function () {
        let url = location.href;
        let issue_id = issueId(url);
        let issue_url = issueUrl(issue_id);
        let headers = {};
        headers[API_HEADER_KEY] = API_KEY;
        let issue_info = await ctx.Misc.getJson(issue_url, headers);
        return issue_info["issue"];
    };

    let changeIssueStatusToClosed = async function () {
        let url = location.href;
        let issue_id = issueId(url);
        let issue_url = issueUrl(issue_id);
        let issue_info = {
            "issue": {
                "status_id": STATUS_CLOSED,
                // "assigned_to_id": 
            }
        };
        let headers = {};
        headers[API_HEADER_KEY] = API_KEY;
        await ctx.Misc.putJson(issue_url, issue_info, headers);
    };

    let reloadPage = function () {
        location.reload(true);
    };

    let eventHandlerForClosedLink = function (event) {
        (async function () {
            try {
                let current_issue_info = await getCurrentIssueInfo();
                if (!canChangeToClosed(current_issue_info)) {
                    alert(chrome.i18n.getMessage("cannot_change_to_closed"));
                    return;
                }

                await changeIssueStatusToClosed();
                let new_issue_info = await getCurrentIssueInfo();
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

    let addEventListenerToClosedLink = function (elem) {
        elem.addEventListener("click", eventHandlerForClosedLink);
    };

    let addChangeToClosedLinks = function () {
        let base_elems = Array.from(document.querySelectorAll(CHANGE_TO_CLOSED_LINK["next_sibling_selector"]));
        if (base_elems.length === 0) {
            console.log("No links are found.");
            return;
        }

        base_elems.forEach((base_elem) => {
            let link_elem = createChangeToClosedLink();
            base_elem.parentNode.insertBefore(link_elem, base_elem);
            addEventListenerToClosedLink(link_elem);
        });
    };

    let insertAdditionalLinks = function () {
        addChangeToClosedLinks();
    };

    let removeAdditionalLinks = function () {
        let elems = Array.from(document.querySelectorAll("." + DECORATOR_CLASS));
        elems.forEach(elem => elem.parentNode.removeChild(elem));
    };

    let addAssigneeSynchronizer = function () {
        let option_selector = `optgroup[Label="${ASSIGNEE_OPTGROUP_LABEL}"] option`;
        document.body.addEventListener("change", function (event) {
            let status_select = event.target;
            if (!status_select || status_select.id != STATUS_SELECT_ID) {
                return;
            }

            if (status_select.value != STATUS_RESOLVED) {
                return;
            }

            let assignee_select = document.querySelector(`#${ASSIGNEE_SELECT_ID}`);
            let assignee_option = Array.from(assignee_select.querySelectorAll(option_selector))
                .find(elem => elem.textContent.trim() == ASSIGNEE_FOR_RESOLVED);
            if (!assignee_option) {
                return;
            }

            assignee_select.selectedIndex = assignee_option.index;
            let change_event = document.createEvent("HTMLEvents");
            change_event.initEvent("change", true, true);
            assignee_select.dispatchEvent(change_event);
        });
    };


    if (isIssuePage(location.href)) {
        removeAdditionalLinks();
        insertAdditionalLinks();
        addAssigneeSynchronizer();
    }
})(RedmineDecorator);
