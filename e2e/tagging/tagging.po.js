/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var TaggingPage = function() {
  this.navToWizardLink = element(by.css('.nav-header [href="/tagging/list"]'));
  this.wizardStart = element(by.css('.header-meta__cta'));
  this.wizardOverlay = element(by.css('.ngdialog-monotote-wizard'));

  this.wizard_create_image = this.wizardOverlay.element(by.css('[ui-sref="tagging.image"]'));
  this.wizard_create_video = this.wizardOverlay.element(by.css('[ui-sref="tagging.video"]'));
  this.wizard_cancel = this.wizardOverlay.element(by.css('.sct-button--cancel'));

  var stepPrefix = '.sct-shoppable-wizard__pane.sct-shoppable-wizard__step--';

  this.stepVideoAdd = this.wizardOverlay.element(by.css(stepPrefix + 'video-add'));

  this.imageUrl = element(by.model('formData.imageUrl'));
  this.videoUrl = element(by.model('formData.videoUrl'));
  this.itemTitle = element(by.model('formData.title'));

  this.startVideoTaggingButton = element(by.css('form[name="msvf"] [type="submit"]'));
  this.startImageTaggingButton = element(by.css('form[name="msif"] [type="submit"]'));
  this.droplets = element(by.css('.droplets'));
  this.dropletsDrag = element.all(by.css('.droplets [ng-drag="true"]'));
  this.wizardDropzone = element.all(by.css('.wizard [ng-drop="true"]')).first(0);

  this.productOverlay = element(by.css('.sct-product-selector__overlay'));
  this.productPanel = this.productOverlay.element(by.css('.sct-product-panel__panel'));
  this.products = this.productPanel.all(by.repeater('product in products'));

  this.stepVideo_draggables = this.stepVideoAdd.all(by.css('[ng-drag]'));

};

module.exports = new TaggingPage();

