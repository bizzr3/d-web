'use strict';

module.exports = function() {
    var router = express.Router();
    var controller = getController('profile');

    // route for the signed in user
    router.get('/', getMiddleware('account.signInCheck'), function(req, res) {
        var page = 'posts';
        return controller.profile(req, res, page);
    });
    
    router.get('/posts', getMiddleware('account.signInCheck'), function(req, res) {
        var page = 'posts';
        return controller.profile(req, res, page);
    });

    router.get('/about', getMiddleware('account.signInCheck'), function(req, res) {
        var page = 'about';
        return controller.profile(req, res, page);
    });
    router.post('/about/update', getMiddleware('account.signInCheck'), controller.profileAboutUpdate);

    router.get('/followers', getMiddleware('account.signInCheck'), function(req, res) {
        var page = 'followers';
        return controller.profile(req, res, page);
    });

    router.post('/relation', getMiddleware('account.signInCheck'), controller.relation);

    router.post(
        '/avatar-upload',
        getMiddleware('account.signInCheck'),
        controller.profileAvatarUpload
    );
    router.post(
        '/cover-upload',
        getMiddleware('account.signInCheck'),
        controller.profileCoverUpload
    );
    // route for targeted username 
    router.get('/:username', getMiddleware('account.signInCheck'), function(req, res) {
        var username = req.params.username;
        var page = 'posts';
        return controller.profile(req, res, page, username);
    });

    router.get('/:username/posts', getMiddleware('account.signInCheck'), function(req, res) {
        var username = req.params.username;
        var page = 'posts';
        return controller.profile(req, res, page, username);
    });

    router.get('/:username/about', getMiddleware('account.signInCheck'), function(req, res) {
        var username = req.params.username;
        var page = 'about';
        return controller.profile(req, res, page, username);
    });

    router.get('/:username/followers', getMiddleware('account.signInCheck'), function(req, res) {
        var username = req.params.username;
        var page = 'followers';
        return controller.profile(req, res, page, username);
    });
    
    router.get('/:username/followers/get-json', getMiddleware('account.signInCheck'), function(req, res) {
        var username = req.params.username;
        return controller.getFollowers(req, res, username);
    });

    return router;
};
