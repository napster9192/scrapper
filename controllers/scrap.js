var scrapModel = require('../models/scrap.js');

/**
 * scrapController.js
 *
 * @description :: Server-side logic for managing scraps.
 */
module.exports = {
    /**
     * scrapController.index()
     */
    index: function (req, res) {
        self.list(req, res);
    },

    /**
     * scrapController.list()
     */
    list: function (req, res, next) {
        scrapModel.find(function (err, scraps) {
            if (err) {
                var err = new Error('Erreur pendant la récupération des scraps');
                err.status = 404;
                next(err);
            }
            else {
                res.render('scrap/list', { title: 'Liste des scraps', items: scraps });
            }
        });
    },

    /**
     * scrapController.show()
     */
    show: function (req, res, next) {
        var id = req.params.id;
        scrapModel.findOne({_id: id}, function (err, scrap) {
            if (err || !scrap) {
                var err = new Error('Le scrap n\'existe pas');
                err.status = 404;
                next(err);
            }
            else {
                res.render('scrap/show', { title: scrap.name, item: scrap });
            }
        });
    },

    /**
     * scrapController.request()
     */
    request: function (req, res, next) {
        var request = require('request');
        var uri = decodeURIComponent(req.query.uri);
        var validUrl = require('valid-url');
        if(validUrl.isUri(uri) == undefined) {
            var err = new Error('Uri non valide');
            err.status = 404;
            next(err);
        }
        else {
            request(uri, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                body = body.replace(
                    '</body>', 
                    '<script src="https://code.jquery.com/jquery-3.1.1.js" integrity="sha256-16cdPddA6VdVInumRGo6IbivbERE8p7CQR3HzTBuELA=" crossorigin="anonymous"></script>' +
                    '<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>' +
                    '<script type="text/javascript" src="/js/selectored.js"></script>' +
                    '<script type="text/javascript" src="/js/scrap_iframe.js"></script>' +
                    '</body>'
                );
                res.send(body);
              }
              else {
                var err = new Error('Uri non valide');
                err.status = 404;
                next(err);
              }
            });    
        }
    },

    /**
     * scrapController.process()
     */
    process: function (req, res, next) {
        var callback = function (req, res, scrap, from) {
            var validate = scrap.validateSync();
            if(!validate) {
                scrap.save(function (err, scrap) {
                    if (err) {
                        req.flash('error', 'Erreur pendant la sauvegarde du scrap');
                    }
                    else {
                        req.flash('info', scrap._id ? 'Scrap mis à jour' : 'Scrap ajouté');
                    }
                    res.redirect('/scrap');
                });
            }
            else {
                var sess = req.session;
                sess.scrap = scrap;
                for(key in validate.errors) {
                    req.flash('info', validate.errors[key].message);
                }

                res.redirect(from);
            }
        };

        var id = req.body.id;
        if(id != undefined) {
            scrapModel.findOne({_id: id}, function (err, scrap) {
                if (err || !scrap) {
                    var err = new Error('Le scrap n\'existe pas');
                    err.status = 404;
                    next(err);
                }
                else {
                    scrap.name = req.body.name ? req.body.name : scrap.name;
                    scrap.uri = req.body.uri ? req.body.uri : scrap.uri;
                    
                    callback(req, res, scrap, '/scrap/update/' + id);
                }
            });    
        }
        else {
            var scrap = new scrapModel({
                name : req.body.name,
                uri : req.body.uri
            });    
            callback(req, res, scrap, '/scrap/create');
        }
    },

    /**
     * scrapController.create()
     */
    create: function (req, res) {
        var sess = req.session;
        var opt = {title: 'Ajouter un scrap', action: '/scrap/process'};
        if(sess.scrap) {
            opt.item = sess.scrap;
            delete sess.scrap;
        }

        res.render('scrap/create', opt);
    },

    /**
     * scrapController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        scrapModel.findOne({_id: id}, function (err, scrap) {
            if (err || !scrap) {
                var err = new Error('Le scrap n\'existe pas');
                err.status = 404;
                next(err);
            }
            else {
                var sess = req.session;
                var opt = {title: 'Modifier le scrap "' + scrap.name + '"', action: '/scrap/process', item: scrap , update: true};
                if(sess.scrap) {
                    opt.item = sess.scrap;
                    delete sess.scrap;
                    res.render('scrap/update', opt);
                }
                res.render('scrap/update', opt);    
            }
        });
    },

    /**
     * scrapController.delete()
     */
    delete: function (req, res) {
        var id = req.params.id;
        scrapModel.findByIdAndRemove(id, function (err, scrap) {
            if (err) {
                var err = new Error('Le scrap n\'existe pas');
                err.status = 404;
                next(err);
            }
            else {
                req.flash('info', 'Scrap supprimé');    
                res.redirect('/scrap');
            }
        });
    }
};
