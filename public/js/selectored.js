;(function($){
    var pluginName = "selectored",
    defaults = {
        'allowed-tags': [
            'a','abbr','acronym','address','article','aside','b','base','basefont','bdi','bdo','big','blockquote','body','button','caption','center','cite','code','col','colgroup','datalist','dd','del','details','dfn','dialog','dir','div','dl','dt','em','embed','fieldset','figcaption','figure','footer','form','h1','h2','h3','h4','h5','h6','head','header','i','img','input','ins','label','legend','li','link','main','mark','menu','menuitem','meter','nav','ol','optgroup','option','p','param','picture','pre','q','s','samp','section','select','small','span','strike','strong','sub','summary','sup','table','tbody','td','textarea','tfoot','th','thead','time','title','tr','tt','u','ul','var'
        ],
        'allowed-attributes': [
            'src','href','value','title','alt', 'label', 'placeholder'
        ],
        'hover-style': {
            'border':'1px solid',
            'box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box'
        },
        'hover-colors-hue-range' : [0, 360],
        'xpath-style': {
            'position':'fixed', 
            'bottom':'0',
            'width':'100%',
            'height':'2em',
            'line-height':'2em',
            'text-overflow': 'ellipsis',
            'box-shadow': '0 0 10px black',
            'background-color':'white',
            'color':'black', 
            'padding':'0 5px', 
            'font-size':'12px'
        },
        'xpath-panel': {
            'position':'fixed', 
            'top':'0',
            'left':'0',
            'width':'200px',
            'height':'300px',
            'box-shadow': '0 0 15px black',
            'border-top-right-radius':'10px', 
            'border-bottom-right-radius':'10px', 
            'background-color':'white',
            'color':'black', 
            'padding':'15px', 
            'font-size':'12px',
            'word-wrap': 'break-word',
            'overflow-y': 'scroll',
            'overflow-x': 'hidden'
        }
    };
 
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
 
    $.extend(Plugin.prototype, {
        init: function () {
            if($(this.element).length != 1 && this.settings['allowed-tags'].indexOf(this.element.tagName.toLowerCase())==-1) {
                return false;
            }

            if($('div.selectored-xpath').length == 0) {
                if(this.settings['xpath-style'].height) {
                    $('body').css('margin-bottom', this.settings['xpath-style'].height);
                }
                $('<div/>').css(this.settings['xpath-style'])
                           .addClass('selectored selectored-xpath')
                           .appendTo($('body'));       
            }
            if($('div.selectored-panel').length == 0) {
                $('<div/>').css(this.settings['xpath-panel'])
                           .addClass('selectored selectored-panel')
                           .appendTo($('body'))
                           .append('<div class="selectored selectored-panel-elem"/>')
                           .append('<div class="selectored selectored-panel-elem-mapper"/>');
                $('.selectored-panel').css('top', ($(window).height()-$('.selectored-panel').height())/2).hide();       
            }
            this._maxDepth = this._initDepth() - 1;
            this.off();
            this.on();
        },
        _initDepth: function (elem, depth) {
            var self = this;
            if(!elem)
                elem = self.element;
            if(!depth)
                depth = 0;

            var children = $(elem).children('*:not(script, style, br)');
            var max = 0;
            if(children.length>0) {
                children.each(function(index, value) {
                    max = Math.max(max, self._initDepth(value, depth+1));
                });
            }
            else {
                return 1;
            }

            return 1+max;
        },
        _getColor: function(hue) {
            var hue_min = this.settings['hover-colors-hue-range'][0],
                hue_max = this.settings['hover-colors-hue-range'][1],
                hue = (hue * (hue_max - hue_min)) + hue_min;
            return 'hsl(' + hue + ', 100%, 50%)';
        },
        _getXpathStr: function(element) {
            var xpath_elem = element.tagName;
            if($(element).attr('id')){
                xpath_elem += '#' + $(element).attr('id');
            } 
            if($(element).attr('class')) {
                xpath_elem += '.' + $(element).attr('class').trim().replace(/\s+/g, '.');
            }
            return xpath_elem;
        },
        _getXpath: function(elements) {
            var self = this,
                xpath = [];
            xpath.push(this._getXpathStr(this.element));
            elements.each(function() {
                xpath.push(self._getXpathStr(this));
            });
            if(!xpath.length) {
                return xpath;
            }
            else {
                return xpath.join(' > ');
            }
        },
        _select: function(e) {
            if(this._selectElement == e.target) {
                this._unselect();
            }
            else {
                this._selectElement = e.target;
                this._showPanel(this._selectElement);
            }
        },
        _unselect: function() {
            this._selectElement = undefined;
            this._hidePanel();
        },
        _showPanel: function(element) {
            var self = this;
            $('.selectored-panel-elem').text(this._getXpathStr(element));
            $('.selectored-panel-elem-mapper').html('');
            var form = $('<form/>');
            var form_line = $('<div/>');
            form_line.append('<input type="checkbox" name="element[content]" value="content"/>');
            switch(element.tagName.toLowerCase()) {
                case 'img':
                    form_line.append($(element).clone().width(10));
                    break;
                default:
                    form_line.append($(element).text());
                    break;
            }
            form.append(form_line);
            
            if(element.attributes.length > 0) {
                var first = true;
                $.each(element.attributes, function() {
                    if(!this.value || self.settings['allowed-tags'].indexOf(this.name)==-1)
                        return true;
                    if(first) {
                        form.append('<div>Attributes</div>');
                        first = false;
                    }
                    form_line = $('<div/>');
                    form_line.append('<input type="checkbox" name="element[attributes][]" value="' + this.name + '"/>');
                    form_line.append(this.name + '="' + this.value + '"');
                    form.append(form_line);
                });    
            }
            

            $('.selectored-panel-elem-mapper').append(form);
            
            $('.selectored-panel').show('slide');
        },
        _hidePanel: function() {
            $('.selectored-panel-elem').text('');
            $('.selectored-panel').hide('slide');
        },
        on: function () {
            var self = this;

            var parents = $(self.element).parentsUntil('body');
            $.each(parents, function(index, parent) {
                $(parent).siblings().css('opacity', 0.25);
            });
            
            //disable navigation
            $('*:not(.selectored)').data('selectored-onclick', function(){
                return $(this).attr('onclick');
            }).attr('onclick', '');
            $(document).on('click.selectored-disable', 'a:not(.selectored), input[type="submit"]:not(.selectored)', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            });
            $(document).on('submit.selectored-disable', 'form:not(.selectored)', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            });

            //selectored events
            $(this.element).on('click.selectored', '*:not(.selectored)', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self._select(e);
            });
            $(document).on('click.selectored', '*:not(.selectored)', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self._unselect();
            });

            $(this.element).on('mouseenter.selectored', '*:not(.selectored)', function(e) {
                var parents = $(this).parentsUntil(self.element);
                var color = self._getColor(parents.length*(1/self._maxDepth));
                $(this).data('selectored-style', $(this).attr('style') ? $(this).attr('style') : '');
                $(this).css(self.settings['hover-style']);
                $(this).css('background-color', color);
                $('div.selectored-xpath').text(self._getXpath(parents)).show();

            }).on('mouseleave.selectored', '*:not(.selectored)', function(e) {
                $(this).attr('style', $(this).data('selectored-style'));
                $('div.selectored-xpath').text('').hide();
            });
        },
        off: function() {
            var parents = $(self.element).parentsUntil('body');
            $.each(parents, function(index, parent) {
                $(parent).siblings().css('opacity', 1);
            });

            $('*:not(.selectored)').attr('onclick', function(){
                return $(this).data('selectored-onclick');  
            });
            $('a:not(.selectored), input[type="submit"]:not(.selectored)').off('click.selectored-disable');
            $('form:not(.selectored)').off('submit.selectored-disable');
            $('*:not(.selectored)').off('click.selectored').off('mouseenter.selectored').off('mouseleave.selectored');
        }
    });
 
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
 
        return this;
    };
}(jQuery));