var express = require('express'),
        routes = require('./routes'),
        http = require('http'),
        path = require('path'),
        i18n = require('i18next');

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, {error: 'Ooops, something went wrong'});
    } else {
        next(err);
    }
}

i18n.init({
    detectLngQS: 'l',
    saveMissing: true,
    debug: false
});

var app = express();

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });
    app.enable('trust proxy');
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
    app.use(express.favicon(__dirname + '/public/images/favicon.ico', {maxAge: 25920000000}));
    app.use(express.logger('dev'));
    app.use(require('less-middleware')({
        src: __dirname + '/less',
        dest: __dirname + '/public',
        prefix: '/public',
        debug: true
    }));

    app.use(express.bodyParser());
    app.use(i18n.handle);
    app.use(express.methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(app.router);
    app.use(clientErrorHandler);
    app.use(function(err, req, res, next) {
        var errobj = {};
        errobj.url = req.protocol + "://" + req.get('host') + req.url;
        errobj.body = req.body;
        errobj.query = req.query;
        errobj.params = req.params;
        res.status(500);
        res.render('error', {title: 'error', request: JSON.stringify(errobj), error: err});
    });
});

i18n.registerAppHelper(app);

app.get('/', routes.index);
app.get('/hb.html', routes.hb);
app.post('/v', routes.validate_POST);
app.get('/v/:token', routes.validate_GET);


// Create an HTTP service.
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});


