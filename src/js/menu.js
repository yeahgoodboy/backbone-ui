(function(){
  window.Backbone.UI.Menu = Backbone.UI.BaseView.extend({

    options : {
      
      // an additional item to render at the top of the menu to 
      // denote the lack of a selection
      emptyItem : null,

      // enables / disables the menu
      disabled : false,

      // A callback to invoke with a particular item when that item is
      // selected from the menu.
      onChange : Backbone.UI.noop,
      
      // text to place in the pulldown button before a
      // selection has been made
      placeholder : 'Select...',
      
      // number of option items to display in the menu
      size : 1
    },

    initialize : function(options) {
      Backbone.UI.BaseView.prototype.initialize.call(this, options);
      this.mixin([Backbone.UI.HasModel, Backbone.UI.HasAlternativeProperty, 
        Backbone.UI.HasFormLabel, Backbone.UI.HasError]);

      _(this).bindAll('render');
      
      this.$el.addClass('menu');
      
      if(!this.options.ignoreErrors) {
        this._observeErrors();
      }

    },


    render : function() {
      this.$el.empty();
      
      this._observeModel(this.render);
      this._observeCollection(this.render);

      this.selectedItem = this._determineSelectedItem();
      // || this.selectedItem;
      var selectedValue = this._valueForItem(this.selectedItem);
      
      this.select = $.el.select({ 
        size : this.options.size,
        disabled : this.options.disabled
       });
      
      // dataStore for options value which stores
      // the option.value to valueForItem
      this._selectOptionsData = {
        placeholder : null,
        emptyItem : null
      };
      
      // setup events for each input in collection
      bean.on(this.select, 'change', _(this._updateModel).bind(this));
      
      var selectedOffset = 0;
      
      // append placeholder option if no selectedItem
      this._placeholder = null;
      if(!this.options.emptyItem && (this.options.size === 1) && !selectedValue) {
        this._placeholder = $.el.option(this.options.placeholder);
        this._placeholder.value = 'placeholder';
        this._placeholder.disabled = 'true';
        this.select.appendChild(this._placeholder);
        // adjust for placeholder option
        selectedOffset++;
      }
      
      if(this.options.emptyItem) {
        this._emptyItem = $.el.option(this._labelForItem(this.options.emptyItem));
        this._emptyItem.value = 'emptyItem';
        this.select.appendChild(this._emptyItem);
        bean.on(this._emptyItem, 'click', _(function() {
          this.select.selectedIndex = 0;
          this._updateModel();
        }).bind(this));
        // adjust for emptyItem option
        selectedOffset++;
      }
      
      // default selectedIndex as placeholder if exists
      this._selectedIndex = -1 + selectedOffset;
      
      _(this._collectionArray()).each(function(item, idx) {
        
        // adjust index for potential placeholder and emptyItem
        idx = idx + selectedOffset;
        
        var val = this._valueForItem(item);
        if(_(selectedValue).isEqual(val)) {
          this._selectedIndex = idx;
        }
        
        var option = $.el.option(this._labelForItem(item));
        option.value = idx;
        this._selectOptionsData[option.value] = val;
        option.selected = this._selectedIndex === idx;
        
        bean.on(option, 'click', _(function(selectedIdx) {
          this.select.selectedIndex = selectedIdx;
          this._updateModel();
        }).bind(this, idx));
        
        this.select.appendChild(option);
        
      }, this);
      
      // set the selectedIndex on the select element
      this.select.selectedIndex = this._selectedIndex;
            
      this.el.appendChild(this.wrapWithFormLabel(this.select));
      
      // scroll to selected Item
      this.scrollToSelectedItem();

      this.setEnabled(!this.options.disabled);
      
      return this;
    },

    // sets the enabled state
    setEnabled : function(enabled) {
      this.$el.toggleClass('disabled', !enabled);
      this.select.disabled = !enabled;
    },

    _labelForItem : function(item) {
      return !_(item).exists() ? this.options.placeholder : 
        this.resolveContent(item, this.options.altLabelContent);
    },

    // sets the selected item
    setSelectedItem : function(item) {
      this._setSelectedItem(item);
      Backbone.UI.Util(this._placeholder).remove();
    },
    
    _updateModel : function() {
      var item = this._itemForValue(this._selectOptionsData[this.select.options[this.select.selectedIndex].value]);
      var changed = this.selectedItem !== item;
      this._setSelectedItem(item);
      // if onChange function exists call it
      if(_(this.options.onChange).isFunction() && changed) {
        this.options.onChange(item);
      }  
    },
    
    _itemForValue : function(val) {
      if(val === null) {
        return val;
      }
      var item = _(this._collectionArray()).find(function(item) {
        var isItem = val === item;
        var itemHasValue = this.resolveContent(item, this.options.altValueContent) === val;
        return isItem || itemHasValue;
      }, this);
      
      return item;
    },
    
    scrollToSelectedItem : function() {
      if(this.select.selectedIndex > 0) {        
        var optionIsMeasurable = this.select.options[0].offsetHeight;
        var optionHeight = optionIsMeasurable > 0 ? optionIsMeasurable : 12;
        this.select.scrollTop = (this.select.selectedIndex * optionHeight);
      }
    }

  });
}());
