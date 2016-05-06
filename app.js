var express     = require('express');
var Forecast    = require('forecast.io');
var session     = require('express-session');
var mongoose    = require('mongoose');
var bodyParser = require('body-parser');
var handlebars  = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        toJSON: function(object) {
            return JSON.stringify(object);
        }
    }
});

var API_KEY     = 'AIzaSyAbAEugRMkqQFC2PRTs1BvrMDNiUpbicrQ';
var app         = express();
var forecast    = new Forecast({APIKey: 'ee17cd367d8f7b705ace75db1bb8efdf'});
var geocoder    = require('node-geocoder')('google', 'https', {apiKey: API_KEY});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: "eaaeuadfauenziedaf123aj", resave: false, saveUninitialized: true}));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');


//connecting Mongoose and setting up Schema
mongoose.connect('mongodb://localhost:27017/skycast');
var userSchema = new mongoose.Schema({
    email : {type: String, unique: true},
    password: {type: String},
    history: {type: [String]}
});
var User = mongoose.model('User', userSchema);


app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    if (req.session.email) {
        return res.send('You\'ve logged in already.');
    }
    res.render('login');
});

app.get('/logout', function(req, res) {
    if (!req.session.email) {
        return res.send('You never logged in.');
    }

    req.session.destroy();
    handlebars.defaultLayout = 'main';
    app.engine('handlebars', handlebars.engine);
    res.render('home');
});

app.post('/login', function(req, res) {
    var query = {email: req.body.email, password: req.body.password};
    User.findOne(query, function(err, user) {
        if (err) {
            console.log(err);
            return res.send('500');
        }

        if (!user)
            return res.send(400, 'Invalid login');

        req.session.email = user.email;

        handlebars.defaultLayout = 'loggedin';
        app.engine('handlebars', handlebars.engine);

        return res.render('home');
    });
});


function search(keyword, history, response) {
    geocoder.geocode(keyword, function(err, res) {
        if (err) {
            console.log(err);
            return response.send('error');
        } else {
            if (res.length == 0)
                return response.send(400, 'no result found!');

            var longitude = res[0].longitude;
            var latitude = res[0].latitude;

            forecast.get(latitude, longitude, function(err, res, data) {
                if (err) {
                    console.log(err)
                    return response.send('error');
                }

                return response.render('search', {
                    keyword: keyword,
                    src: 'https://www.google.com/maps/embed/v1/place?key=' + API_KEY + '&q=' + latitude + ", " + longitude,
                    data: data.daily.data,
                    history: history
                });
            });
        }
    });
}

app.post('/search', function(req, response) {
    if (req.session.email) {
        User.findOne({email: req.session.email}, function(err, user) {
            user.history.unshift(req.body.keyword);
            user.save(function(err, updatedUser) {
                search(req.body.keyword, updatedUser.history, response);
            });

        });
    } else {
        search(req.body.keyword, ['[please login]'], response);
    }
});

app.get('/register', function(req, res) {
    if (req.session.email) {
        return res.send('Please log out first.');
    }
    return res.render('register');
});

app.post('/register', function(req, res) {
    var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        history: []
    });

    newUser.save(function(err, savedUser) {
        if (err) {
            console.log(err);
            return res.status(500);
        }

        return res.status(200).send('Success');
    });
});

app.use(function(req, res, next) {
    console.log("Looking for URL: " + req.url);
    next();
});

// getting the server thread running and export it out as module for testing
var server = app.listen(app.get('port'), function() {
    console.log('Express started press Ctrl-C to terminate');
});
module.exports = server;