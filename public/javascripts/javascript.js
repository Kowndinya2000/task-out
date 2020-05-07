var already_notified = false;
function edit_form(res) {
    document.getElementById('title').value = res[1]
    document.getElementById('title_label').click(); 
    document.getElementById('date').value = res[2]
    document.getElementById('date_label').click();
    document.getElementById('time').value = res[3]
    document.getElementById('time_label').click()
    document.getElementById('endTime').value = res[4]
    document.getElementById('endTime_label').click()
    document.getElementById('notify_before').value = res[5]
    document.getElementById('notify_label').click()
    document.getElementById('image_label').click()
    document.getElementById('link').value = res[6]
    document.getElementById('link_label').click();
    document.getElementById('note').value = res[7]
    document.getElementById('note_label').click()
    document.getElementById('form_button').innerHTML = "Update Event"
}
  function editEvent(params) 
  {
    var res = params.split(",")
    delEvent(res[0])
    edit_form(res)
    document.getElementById('form_button').innerText = "Schedule Event"
    document.getElementById('update_Event').style.display = "block"
    document.getElementById('return_p').style.display = "none"
  }
  function delEvent(params) {
    var xhttp3 = new XMLHttpRequest()
    xhttp3.withCredentials = true
    xhttp3.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200)
        {
            var res = JSON.parse(this.responseText).delete_msg
            if(res == null)
            {
                console.log('No upcoming Notifications!! Schedule an event now!')
            }
            else{
                console.log(res)
                setTimeout(() => {
            var xhttp = new XMLHttpRequest()
            xhttp.withCredentials = true
            xhttp.onreadystatechange = function () {
                if(this.readyState == 4 && this.status == 200)
                {
                    var res = JSON.parse(this.responseText).noti_msg
                    if(res == null)
                    {
                        document.getElementById('notifications_p').style.display = "block"
                        document.getElementById('notifications_p').innerHTML = " <span style='padding:0 0.5rem;'>No upcoming Notifications!! Schedule an event now!</span>"
                        console.log('No upcoming Notifications!! Schedule an event now!')
                        
                    }
                    else{
                        
                        document.getElementById('notifications_p').style.display = "block"
                        document.getElementById('notifications_p').innerHTML = ""
                       for(var i=0;i<res.length;i++)
                       {

                        var tmp2 = res[i].metadata.date + " "  + res[i].metadata.time 
                           var t1 = new Date().getTime()
                           var t2 = new Date(tmp2).getTime()
                           console.log(t1 + "," +  t2)
                           if(t2 < t1)
                           {
                            document.getElementById('notifications_p').innerHTML = 'No Events Scheduled!'
                             
                             delEvent(res[i].filename)
                            
                           }
                           else
                           {
                             
                            var updateString = res[i].filename+","+res[i].metadata.title.replace(/\'/g, "\\'")+","+res[i].metadata.date+","+res[i].metadata.time+","+res[i].metadata.endTime+","+res[i].metadata.notify_before+","+res[i].metadata.link+","+res[i].metadata.note.replace(/\'/g, "\\'")
                            document.getElementById('notifications_p').innerHTML += 
'<ul><li><div class="bullet blue"></div><div class="time">' + res[i].metadata.time + ' - ' + res[i].metadata.endTime
+ '<p style="color:#53588b;margin-top:0.3rem;font-weight:bold">'+ res[i].metadata.date +'</p>'
+'<p style="background: #456FFF;padding:0.2rem;border-radius:0.2rem;width:fit-content;margin-top:0.5rem;color:white;cursor:pointer"  onclick="editEvent(' + '\'' +  updateString + '\')">Edit&nbsp;&nbsp;<i class="fa fa-pencil" aria-hidden="true"></i></p>'
+'<p style="background: red;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;" onclick="delEvent(' + '\'' +  res[i].filename + '\')">Delete&nbsp;&nbsp;<i class="fa fa-trash" aria-hidden="true"></i></p>'+
'<p style="background: #53588b;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;"><a href="' + res[i].metadata.link +'" style="color:white;text-decoration:none;" target="_blank">Link&nbsp;&nbsp;<i class="fa fa-link" aria-hidden="true"></i></a></p>'+
'</div><div class="desc" style="margin-left:2rem;"><h3>' +  res[i].metadata.title + '</h3><h4>'+ res[i].metadata.note +'</h4><div class="people">'
+'<img src="image/' +  document.getElementById('email').innerText + "/" + res[i].filename + '"></div></div></li></ul>'
var h1 = parseInt(res[i].metadata.time)
                           }                                    
} 
                    }
                }
            }
            xhttp.withCredentials = false
            xhttp.open("POST","/notifications",true)
            xhttp.setRequestHeader('Content-type',"application/x-www-form-urlencoded")
            xhttp.send('link='+document.getElementById('email').innerText)
}, 1000);

            }
        }
    }
    xhttp3.withCredentials = false
    xhttp3.open("POST","/delEvent",false)
    xhttp3.setRequestHeader('Content-type',"application/x-www-form-urlencoded")
    xhttp3.send('emailval='+document.getElementById('email').innerText + ','+ params)
  }
  setInterval(() => {
    $().ready(()=>{
          if($("#login").is(':hidden'))
          {
              var xhttp2 = new XMLHttpRequest()
              xhttp2.withCredentials = true
              xhttp2.onreadystatechange = function () {
                  if(this.readyState == 4 && this.status == 200)
                  {
                      var result = JSON.parse(this.responseText).notify
                      if(result == null)
                      {
                          already_notified = false;
                          console.log('No upcoming Notifications!! Schedule an event now!')
                      }
                      else{
                        if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
      else if (Notification.permission === "granted") {
            var options = {
                    body: result.metadata.note,
                    icon: '/image/' + document.getElementById('email').innerText + "/" + result.filename,
                    dir : "ltr"
                 };
              var notification = new Notification(result.metadata.title,options);
              notification.onclick = function () {
                window.open("" + result.metadata.link + "","_blank")
              }
      }
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          if (!('permission' in Notification)) {
            Notification.permission = permission;
          }
       
          if (Notification.permission === "granted") {
            var options = {
                    body: result.metadata.note,
                    icon: '/image/' + document.getElementById('email').innerText + "/" + result.filename,
                    dir : "ltr"
                 };
              var notification = new Notification(result.metadata.title,options);
              notification.onclick = function () {
                window.open("" + result.metadata.link + "","_blank")
              }
      }
        });
      }
                      already_notified = true;
                      }
                  
              }    
            }
              xhttp2.withCredentials = false
              xhttp2.open("POST","/pushnotifications",true)
              xhttp2.setRequestHeader('Content-type',"application/x-www-form-urlencoded")
              console.log(already_notified)
              xhttp2.send('emailval='+document.getElementById('email').innerText+","+already_notified)
      
            }})
            }, 25000);

            $().ready(()=>{
                if($("#login").is(':hidden'))
                {
                    var xhttp = new XMLHttpRequest()
                    xhttp.withCredentials = true
                    xhttp.onreadystatechange = function () {
                        if(this.readyState == 4 && this.status == 200)
                        {
                            var res = JSON.parse(this.responseText).noti_msg
                            if(res == null)
                            {
                                document.getElementById('notifications_p').style.display = "block"
                                document.getElementById('notifications_p').innerHTML = '<span style="padding:0 0.5rem;">No upcoming Notifications!! Schedule an event now!</span>'
                                console.log('No upcoming Notifications!! Schedule an event now!')
                                
                            }
                            else{
                              
                                document.getElementById('notifications_p').style.display = "block"
                                document.getElementById('notifications_p').innerHTML = ""
                               for(var i=0;i<res.length;i++)
                               {
                                   var tmp2 = res[i].metadata.date + " "  + res[i].metadata.time 
                                   var t1 = new Date().getTime()
                                   var t2 = new Date(tmp2).getTime()
                                   console.log(t1 + "," +  t2)
                                   if(t2 < t1)
                                   {
                                     document.getElementById('notifications_p').innerHTML = 'No Events Scheduled!'
                                     
                                     delEvent(res[i].filename)
                                    
                                   }
                                   else
                                   {
                                     
                                    var updateString = res[i].filename+","+res[i].metadata.title.replace(/\'/g, "\\'")+","+res[i].metadata.date+","+res[i].metadata.time+","+res[i].metadata.endTime+","+res[i].metadata.notify_before+","+res[i].metadata.link+","+res[i].metadata.note.replace(/\'/g, "\\'")
                                    document.getElementById('notifications_p').innerHTML += 
'<ul><li><div class="bullet blue"></div><div class="time">' + res[i].metadata.time + ' - ' + res[i].metadata.endTime
  + '<p style="color:#53588b;margin-top:0.3rem;font-weight:bold">'+ res[i].metadata.date +'</p>'
  +'<p style="background: #456FFF;padding:0.2rem;border-radius:0.2rem;width:fit-content;margin-top:0.5rem;color:white;cursor:pointer"  onclick="editEvent(' + '\'' +  updateString + '\')">Edit&nbsp;&nbsp;<i class="fa fa-pencil" aria-hidden="true"></i></p>'
+'<p style="background: red;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;" onclick="delEvent(' + '\'' +  res[i].filename + '\')">Delete&nbsp;&nbsp;<i class="fa fa-trash" aria-hidden="true"></i></p>'+
'<p style="background: #53588b;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;"><a href="' + res[i].metadata.link +'" style="color:white;text-decoration:none;" target="_blank">Link&nbsp;&nbsp;<i class="fa fa-link" aria-hidden="true"></i></a></p>'+
'</div><div class="desc" style="margin-left:2rem;"><h3>' +  res[i].metadata.title + '</h3><h4>'+ res[i].metadata.note +'</h4><div class="people">'
+'<img src="image/' +  document.getElementById('email').innerText + "/" + res[i].filename + '"></div></div></li></ul>'
                                   }
                                  
                               } 
                            }
                        }
                    }
                    xhttp.withCredentials = false
                    xhttp.open("POST","/notifications",true)
                    xhttp.setRequestHeader('Content-type',"application/x-www-form-urlencoded")
                    xhttp.send('link='+document.getElementById('email').innerText)
                }
            })
  
        setInterval(() => {
            $().ready(()=>{
                if($("#login").is(':hidden'))
                {
                    var xhttp = new XMLHttpRequest()
                    xhttp.withCredentials = true
                    xhttp.onreadystatechange = function () {
                        if(this.readyState == 4 && this.status == 200)
                        {
                            var res = JSON.parse(this.responseText).noti_msg
                            if(res == null)
                            {
                                document.getElementById('notifications_p').style.display = "block"
                                document.getElementById('notifications_p').innerHTML = "No upcoming Notifications!! Schedule an event now!"
                                console.log('No upcoming Notifications!! Schedule an event now!')
                            }
                            else{
                                
                                document.getElementById('notifications_p').style.display = "block"
                                document.getElementById('notifications_p').innerHTML = ""
                               for(var i=0;i<res.length;i++)
                               {
                                   var tmp2 = res[i].metadata.date + " "  + res[i].metadata.time 
                                   var t1 = new Date().getTime()
                                   var t2 = new Date(tmp2).getTime()
                                   console.log(t1 + "," +  t2)
                                   if(t2 < t1)
                                   {
                                    document.getElementById('notifications_p').innerHTML = 'No Events Scheduled!'
                                     
                                     delEvent(res[i].filename)
                                    
                                   }
                                   else
                                   {
                                     
                                    var updateString = res[i].filename+","+res[i].metadata.title.replace(/\'/g, "\\'")+","+res[i].metadata.date+","+res[i].metadata.time+","+res[i].metadata.endTime+","+res[i].metadata.notify_before+","+res[i].metadata.link+","+res[i].metadata.note.replace(/\'/g, "\\'")
                                    document.getElementById('notifications_p').innerHTML += 
'<ul><li><div class="bullet blue"></div><div class="time">' + res[i].metadata.time + ' - ' + res[i].metadata.endTime
  + '<p style="color:#53588b;margin-top:0.3rem;font-weight:bold">'+ res[i].metadata.date +'</p>'
  +'<p style="background: #456FFF;padding:0.2rem;border-radius:0.2rem;width:fit-content;margin-top:0.5rem;color:white;cursor:pointer"  onclick="editEvent(' + '\'' +  updateString + '\')">Edit&nbsp;&nbsp;<i class="fa fa-pencil" aria-hidden="true"></i></p>'
+'<p style="background: red;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;" onclick="delEvent(' + '\'' +  res[i].filename + '\')">Delete&nbsp;&nbsp;<i class="fa fa-trash" aria-hidden="true"></i></p>'+
'<p style="background: #53588b;padding:0.2rem;border-radius:0.2rem;color:white;width:fit-content;margin-top:0.5rem;cursor:pointer;"><a href="' + res[i].metadata.link +'" style="color:white;text-decoration:none;" target="_blank">Link&nbsp;&nbsp;<i class="fa fa-link" aria-hidden="true"></i></a></p>'+
'</div><div class="desc" style="margin-left:2rem;"><h3>' +  res[i].metadata.title + '</h3><h4>'+ res[i].metadata.note +'</h4><div class="people">'
+'<img src="image/' + document.getElementById('email').innerText + "/" + res[i].filename + '"></div></div></li></ul>'
                               
                               }
                              } 
                            }
                        }
                    }
                    xhttp.withCredentials = false
                    xhttp.open("POST","/notifications",true)
                    xhttp.setRequestHeader('Content-type',"application/x-www-form-urlencoded")
                    xhttp.send('link='+document.getElementById('email').innerText)
                }
            })
        }, 55000);
        ;(function()
        {
            function loadbar() 
            {
                var ovrl = document.getElementById("overlay"),
                img = document.getElementsByClassName('ifrms'),
                c = 0;
                tot = img.length;
                function imgLoaded(){
                    c += 1;
                    var perc = ((100/tot*c) << 0) +"%";
                    if(c===tot) return doneLoading();
                }
                function doneLoading()
                {
                    ovrl.style.opacity = 0;
                    setTimeout(function(){ 
                        ovrl.style.display = "none";
                    }, 1200);
                }
                for(var i=0; i<tot; i++) 
                {
                    var tImg     = new Image();
                    tImg.onload  = imgLoaded;
                    tImg.onerror = imgLoaded;
                    tImg.src     = img[i].src;
                }    
            }
            document.addEventListener('DOMContentLoaded', loadbar, false);
        }());
        window.console = window.console || function(t) {};
        if (document.location.search.match(/type=embed/gi)) {
            window.parent.postMessage("resize", "*");
          }
          function form_load() {
            var date = new Date()
            document.getElementById('date').value = date.getFullYear() + "-"  + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + (date.getDate())).slice(-2)
            document.getElementById('date_label').click();
            document.getElementById('time').value = ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2)
            document.getElementById('time_label').click()
            document.getElementById('endTime').value = ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2)
            document.getElementById('endTime_label').click()
            document.getElementById('notify_before').value = "00:05"
            document.getElementById('notify_label').click()
        }
        setTimeout(() => {
            $().ready(()=>{
              $.get("/api/user")
              .then((resp)=>{
                  if(resp)
                  {
                  $('#user').text("Hi " + resp.user.name + "!")
                  $("#email").text(resp.user.email)
                  $("#email2").val(resp.user.email)
                  $("#picture").show()
                  if(resp.user.picture)
                  {
                    document.getElementById("picture").src = resp.user.picture
                  }
                  else{
                  var first_Char = resp.user.name.toLowerCase().split(" ")[0].charAt(0)
                  if(first_Char == 'U' || first_Char == 'u')
                  {
                    first_Char = resp.user.name.toLowerCase().split(" ")[1].charAt(0)
                  }
                  var img_src =  "/images/" + first_Char.toString() + ".png"
                  console.log(img_src)
                  document.getElementById("picture").src = img_src
                  }
                  $("#logout_box").show()
                  $("#login_box").hide()
                  $("#event_form").show()
                  form_load()
                  $("#notifications_p").show()
                  $("#instr_panel").show()
                  }
                  
              })
          })
      
          }, 100);
            // Stores the original url in the local storage
    window.localStorage.setItem('specifiedKey', window.location.href);

    // Cleans the query parameter of a string and replace it in the history API
    const cleanUrl = location.href.match(/^.+(?=\?)/g);
    window.history.replaceState(null, null, (cleanUrl ? cleanUrl[0] : location.href));

    // the history is updated before the window reloads
    window.onbeforeunload = () => {
    window.history.replaceState(null, null, window.localStorage.getItem('specifiedKey'));
        }
  