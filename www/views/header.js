define([
  'jquery',
  'underscore',
  'backbone',
  'models/settings',
  'models/subscription',
  'views/alert',
  'views/modalSettings',
  'views/modalSubscribe',
  'views/modalEnterprise',
  'views/modalFeedback',
  'text!templates/header.html'
], function($, _, Backbone, SettingsModel, SubscriptionModel, AlertView,
    ModalSettingsView, ModalSubscribeView, ModalEnterpriseView,
    ModalFeedbackView, headerTemplate) {
  'use strict';
  var HeaderView = Backbone.View.extend({
    tagName: 'header',
    template: _.template(headerTemplate),
    events: {
      'click .enterprise-upgrade a, .enterprise-settings a': 'onEnterprise',
      'click .change-password a': 'openSettings',
      'click .feedback': 'onFeedback'
    },
    render: function() {
      this.$el.html(this.template());
      return this;
    },
    onEnterprise: function() {
      if (this.onEnterpriseLock) {
        return;
      }
      this.onEnterpriseLock = true;
      var model = new SubscriptionModel();
      model.fetch({
        success: function(model) {
          if (model.get('plan')) {
            this.enterpriseSettings(model);
          }
          else {
            this.enterpriseUpgrade();
          }
          this.onEnterpriseLock = false;
        }.bind(this),
        error: function() {
          var alertView = new AlertView({
            type: 'danger',
            message: 'Failed to load subscription information, ' +
              'server error occurred.',
            dismissable: true
          });
          $('.alerts-container').append(alertView.render().el);
          this.addView(alertView);
          this.onEnterpriseLock = false;
        }.bind(this)
      });
    },
    enterpriseUpgrade: function() {
      var modal = new ModalSubscribeView();
      this.listenToOnce(modal, 'applied', function() {
        var alertView = new AlertView({
          type: 'success',
          message: 'Welcome to Pritunl Enterprise.',
          dismissable: true
        });
        $('.alerts-container').append(alertView.render().el);
        this.addView(alertView);
      }.bind(this));
      this.addView(modal);
    },
    enterpriseSettings: function(model) {
      var modal = new ModalEnterpriseView({
        model: model
      });
      this.listenToOnce(modal, 'applied', function() {
        var alertView = new AlertView({
          type: 'danger',
          message: 'Enterprise license removed.',
          dismissable: true
        });
        $('.alerts-container').append(alertView.render().el);
        this.addView(alertView);
      }.bind(this));
      this.addView(modal);
    },
    openSettings: function() {
      var model = new SettingsModel();
      model.fetch({
        success: function() {
          var modal = new ModalSettingsView({
            model: model
          });
          this.listenToOnce(modal, 'applied', function() {
            var alertView = new AlertView({
              type: 'success',
              message: 'Successfully saved settings.',
              dismissable: true
            });
            $('.alerts-container').append(alertView.render().el);
            this.addView(alertView);
          }.bind(this));
          this.addView(modal);
        }.bind(this),
        error: function() {
          var alertView = new AlertView({
            type: 'danger',
            message: 'Failed to load authentication data, ' +
              'server error occurred.',
            dismissable: true
          });
          $('.alerts-container').append(alertView.render().el);
          this.addView(alertView);
        }.bind(this)
      });
    },
    onFeedback: function() {
      var modal = new ModalFeedbackView();
      this.listenToOnce(modal, 'applied', function() {
        var alertView = new AlertView({
          type: 'success',
          message: 'Successfully submitted feedback/bug report.',
          dismissable: true
        });
        $('.alerts-container').append(alertView.render().el);
        this.addView(alertView);
      }.bind(this));
      this.addView(modal);
    }
  });

  return HeaderView;
});
