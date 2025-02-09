console.log("v2 test")

let db = new Localbase('db')

console.log('live')

let apinode = "https://api.deathwing.me";
let response, startpermlink, beforedate = "";
let xhr = new XMLHttpRequest();
localStorage.setItem("status", "start");
document.getElementById("step2").style.display = `none`;



function fetchPosts() {
  document.getElementById('mainContent').scrollIntoView();
  document.getElementById("main").style.display = `none`;
  document.getElementById("mainContent").style.display = `block`;
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




/* TODO: 
 db.collection('sn0n').orderBy('created').get().then(data => {
 console.log(data)
 })

 db.collection('sn0n.dev').get().then(posts => {
   posts.forEach(key => {
     console.log(key);
   });
 });
 
 END TODO */

var zip = new JSZip();





function downloadPosts() {

  document.getElementById("step2").innerHTML = `Building Zip - Compressing<br /><center><progress class="pure-material-progress-circular"/></center>`;
  console.log("downloading");


  db.collection(localStorage.getItem("hiveaccount")).get().then(posts => {
    posts.forEach(key => {


      //console.log(key.permlink);
      // set frontmatter for the generated .md file
      let frontmatter = `---\ntags: [` + key.json_metadata.tags + `]\ntitle: [hive]` + key.title + `\ncreated: '` + key.created + `'\nmodified: '` + key.created + `'\n---\n\n# `
      // add file to zip
      parsed = key.body.split('<center>').join('<center>\n\n');
      parsed = parsed.split('</center>').join('\n\n</center>');
      zip.file(localStorage.getItem("hiveaccount") + "/" + key.created.substring(0, 10) + "-" + localStorage.getItem("hiveaccount") + "-" + key.permlink
        + ".md", frontmatter + key.title + "\n" + parsed, {date : new Date(key.created.substring(0, 10))});

      return zip;
    });
  }).then(zip => savzip());

}


function savzip() {
  zip.generateAsync({ type: "blob" })
    .then(function (blob) {
      saveAs(blob, localStorage.getItem("hiveaccount") + ".zip");
      document.getElementById("step2").innerHTML = `Downloading posts for ` + whoami + `<br /> Download Another?<br /><button class="mdl-button mdl-js-button mdl-button--raised" onclick='location.reload();window.scrollTo(0, 0);'>Yes</button>`;
      document.getElementById("step2").style.display = `block`;
      
    });
}

window.onload = function () {
  console.log('ready to go');
  localStorage.clear();
};


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
          stats = parseInt(document.getElementById("status").innerHTML);
          stats++;
          document.getElementById("status").innerHTML = stats;
          if (data.result[i] !== undefined) {
            console.log('lets try this post:' + JSON.stringify(data.result[i]));
            db.collection(data.result[i].author).doc(data.result[i].permlink).set({
              id: data.result[i].post_id,
              permlink: data.result[i].permlink,
              title: data.result[i].title,
              body: data.result[i].body,
              json_metadata: data.result[i].json_metadata,
              created: data.result[i].created,
            });
            if (data.result[i].permlink !== undefined) {
              console.log("request data updated")
              localStorage.setItem("indexreq", `{"jsonrpc":"2.0", "method":"bridge.get_account_posts", "params":{"sort":"posts","account": "` + data.result[i].author + `","start_permlink": "` + data.result[i].permlink + `","start_author": "` + localStorage.getItem("hiveaccount") + `",  "limit": 20}, "id":1}`);
            }
          } else {
            document.getElementById("step1").style.display = `none`;
            document.getElementById("step2").innerHTML = `<button class="mdl-button mdl-js-button mdl-button--raised" onclick="downloadPosts()"><i class="material-icons">download</i> Prepare & Download</button>`;
            localStorage.setItem("status", "complete");
            return console.log("request complete");

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