Changes to app.js:(Before pushing to Heroku)
1) In get method add (at the top): 
    res.header('Acess-Control-Allow-Credentials','true')
    res.header('Access-Control-Allow-Origin', '*');
2) In post method add (at the top):
    req.header('Access-Control-Allow-Origin', '*');