Changes to app.js:(Before pushing to Heroku)
1) In get method add (at the top): 
    <p>res.header('Acess-Control-Allow-Credentials','true')</p>
    <p>res.header('Access-Control-Allow-Origin', '*');</p>
2) In post method add (at the top):
    <p>req.header('Access-Control-Allow-Origin', '*');</p>