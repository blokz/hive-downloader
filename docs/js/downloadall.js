let apinode = "https://api.deathwing.me";

let startpermlink = ""
let beforedate = ""
let xhr = new XMLHttpRequest();
let response = ""
localStorage.setItem("status", "start");






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
                        console.log('lets try this post:' + JSON.stringify(data.result[i]));
                        localStorage.setItem(JSON.stringify(data.result[i].author) + "." + JSON.stringify(data.result[i].permlink), JSON.stringify(data.result[i]));
                        if (data.result[i].permlink !== undefined) {
                            console.log("request data updated")
                            localStorage.setItem("indexreq", `{"jsonrpc":"2.0", "method":"bridge.get_account_posts", "params":{"sort":"posts","account": "` + data.result[i].author + `","start_permlink": "` + data.result[i].permlink + `","start_author": "` + localStorage.getItem("hiveaccount") + `",  "limit": 20}, "id":1}`);
                        }

                    } else {

                        document.getElementById("step1").style.display = `none`;
                        document.getElementById("downloadPosts").innerHTML = `<button onclick="downloadPosts()">Download Posts</button>`;
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
    localStorage.setItem("hiveaccount", document.getElementById("user").value);
    if (localStorage.getItem("indexreq") == undefined) {
        let requestData = '{"jsonrpc":"2.0", "method":"bridge.get_account_posts", "params":{"sort":"posts","account": "' + localStorage.getItem("hiveaccount") + '",  "limit": 20}, "id":1}';
        localStorage.setItem("indexreq", requestData);
    }
    if (localStorage.getItem("status") !== "complete") {
        fetchNow();
    }
}


function downloadPosts() {
    document.getElementById("downloadPosts").innerHTML = `<progress class="pure-material-progress-circular"/>`;
    console.log("downloading");
    var zip = new JSZip();
    for (var i = 0, len = localStorage.length; i < len; ++i) {

        if (JSON.parse(localStorage.getItem(localStorage.key(i)).includes("post_id")) !== false) {
            let currentPost = JSON.parse(localStorage.getItem(localStorage.key(i)))
            console.log(currentPost.permlink);
            zip.file(localStorage.getItem("hiveaccount") + "posts/" + currentPost.created.substring(0, 10) + "-" + currentPost.permlink + ".md", "#" + currentPost.title + "\n" + currentPost.body);
        }
    }
    zip.generateAsync({ type: "blob" })
        .then(function (blob) {
            saveAs(blob, localStorage.getItem("hiveaccount") + ".zip");
            document.getElementById("downloadPosts").innerHTML = `All Done`;
        });

}


function reset() {
    document.getElementById("step1").style.display = `block`;
    document.getElementById('status').innerHTML = '0';
    document.getElementById("downloadPosts").innerHTML = ``;
    localStorage.clear();
    alert('cache cleared')
}


window.onload = function () {
    console.log('ready to go');
    localStorage.clear();
};