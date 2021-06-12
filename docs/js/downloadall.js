let apinode = "https://api.deathwing.me";
let response, startpermlink, beforedate = "";
let xhr = new XMLHttpRequest();
localStorage.setItem("status", "start");
document.getElementById("step2").style.display = `none`;

var fetchNow = function () {
    fetch(apinode, {
        body: localStorage.getItem("indexreq"),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    }).then(response => response.json()).then(data => {
        if (localStorage.getItem("status") !== "complete") {
            if (data !== undefined) {
                console.log(data.result[0])
                for (i = 0; i < 20; i++) {
                    status = parseInt(document.getElementById("status").innerHTML);
                    status++;
                    document.getElementById("status").innerHTML = status;
                    if (data.result[i] !== undefined) {
                        //console.log('lets try this post:' + JSON.stringify(data.result[i]));
                        key = "active_votes";
                        delete data.result[i][key];
                        console.log('lets try this post:' + JSON.stringify(data.result[i]));
                        localStorage.setItem(JSON.stringify(data.result[i].author) + "." + JSON.stringify(data.result[i].permlink), LZString.compress(JSON.stringify(data.result[i])));
                        if (data.result[i].permlink !== undefined) {
                            console.log("request data updated")
                            localStorage.setItem("indexreq", `{"jsonrpc":"2.0", "method":"bridge.get_account_posts", "params":{"sort":"posts","account": "` + data.result[i].author + `","start_permlink": "` + data.result[i].permlink + `","start_author": "` + localStorage.getItem("hiveaccount") + `",  "limit": 20}, "id":1}`);
                        }
                    } else {
                        document.getElementById("step1").style.display = `none`;
                        document.getElementById("step2").innerHTML = `<stong>Posts Downloaded for ` + localStorage.getItem("hiveaccount") + `</strong><br /><button class="mdl-button mdl-js-button mdl-button--raised" onclick="downloadPosts()">Create Archive & Download</button>`;
                        localStorage.setItem("status", "complete")
                        return console.log("requst complete");
                    }
                }
            } else {
                console.log(response.result)
                localStorage.setItem("status", "complete")
            }
        }
        if (localStorage.getItem("status") !== "complete") {
            fetchNow();
        } else {
            return console.log('all done');
        }
    });
}

function fetchPosts() {
    document.getElementById('mainContent').scrollIntoView();
    document.getElementById("step1").style.display = `none`;
    document.getElementById("step2").style.display = `block`;
    whoami = document.getElementById("user").value;
    localStorage.setItem("hiveaccount", document.getElementById("user").value);
    document.getElementById('status').innerHTML = '0';
    if (localStorage.getItem("indexreq") == undefined) {
        let requestData = '{"jsonrpc":"2.0", "method":"bridge.get_account_posts", "params":{"sort":"posts","account": "' + localStorage.getItem("hiveaccount") + '",  "limit": 20}, "id":1}';
        localStorage.setItem("indexreq", requestData);
    }
    if (localStorage.getItem("status") !== "complete") {
        fetchNow();
    }
}

function downloadPosts() {
    document.getElementById("step2").innerHTML = `<progress class="pure-material-progress-circular"/>`;
    console.log("downloading");
    var zip = new JSZip();
    for (var i = 0, len = localStorage.length; i < len; ++i) {
        if (localStorage.key(i) == "status" || localStorage.key(i) == "hiveaccount" || localStorage.key(i) == "indexreq") {
            console.log('false')
        } else {
            if (JSON.parse(LZString.decompress(localStorage.getItem(localStorage.key(i))).includes("post_id")) !== false) {
                let currentPost = JSON.parse(LZString.decompress(localStorage.getItem(localStorage.key(i))));
                console.log(currentPost.permlink);
                // set frontmatter for the generated .md file
                let frontmatter = `---\ntags: [` + currentPost.json_metadata.tags + `]\ntitle: [hive]` + currentPost.title + `\ncreated: '` + currentPost.created + `'\nmodified: '` + currentPost.created + `'\n---\n\n# `
                // add file to zip
                parsed = currentPost.body.split('<center>').join('<center>\n\n');
                parsed = parsed.split('</center>').join('\n\n</center>');
                zip.file(localStorage.getItem("hiveaccount") + "/" + currentPost.created.substring(0, 10) + "-" + currentPost.author + "-" + currentPost.permlink
                    + ".md", frontmatter + currentPost.title + "\n" + parsed);
            }
        }
    }
    zip.generateAsync({ type: "blob" })
        .then(function (blob) {
            saveAs(blob, localStorage.getItem("hiveaccount") + ".zip");
            document.getElementById("step2").innerHTML = `Downloading posts for ` + whoami + `<br /> Download Another?<br /><button class="mdl-button mdl-js-button mdl-button--raised" onclick='location.reload();window.scrollTo(0, 0);'>Yes</button>`;
            document.getElementById("step2").style.display = `block`;
            localStorage.clear();
        });
}

window.onload = function () {
    console.log('ready to go');
    localStorage.clear();
};