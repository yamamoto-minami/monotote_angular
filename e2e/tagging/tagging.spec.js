'use strict';

var config = require('../../test/environment');

describe('Main View', function() {
  var page,
    loginPage,
    loginComplete = false;

  beforeEach(function() {
    if (!loginComplete) {
        loginPage = require('../login/login.po');
        page = require('./tagging.po');
        browser.get('/login');
        loginPage.email.clear().sendKeys(config.user.username);
        loginPage.password.clear().sendKeys(config.user.password);
        loginPage.login.click();
        loginComplete = true;
    } else {
        browser.get('/tagging/list');
    }
  });

  it('should navigate to tagging page', function() {
    expect(page.navToWizardLink.isPresent()).toBe(true);
    page.navToWizardLink.click()
    .then(function() {
        expect(page.wizardStart.isPresent()).toBe(true);
    });
  });

  it('should display the wizard overlay', function() {
    page.wizardStart.click()
    .then(function() {
      expect(page.wizardOverlay.isPresent()).toBe(true);
      expect(page.wizard_create_image.isPresent()).toBe(true);
      expect(page.wizard_create_video.isPresent()).toBe(true);
    });
  });

  it('should show the image selection step', function() {
    page.wizardStart.click()
    .then(function() {
      page.wizard_create_image.click().then(function() {
        expect(page.imageUrl.isPresent()).toBe(true);
      });
    });
  });

  it('should show the video select step', function() {
    page.wizardStart.click()
    .then(function() {
      page.wizard_create_video.click().then(function() {
        expect(page.videoUrl.isPresent()).toBe(true);
      });
    });
  });

  it('should set the image url', function() {
    page.wizardStart.click().then(function() {
      page.wizard_create_image.click()
      .then(function() {
        browser.sleep(500);
        page.itemTitle.sendKeys('The title');
        page.imageUrl.sendKeys('https://placeholdit.imgix.net/~text?txtsize=400&txt=XYZ&w=800&h=800&txttrack=0')
        //page.imageUrl.sendKeys('http://lorempixel.com/400/400/fashion')
        .then(function() {
          browser.sleep(500)
          page.startImageTaggingButton.click()
          .then(function() {
            expect(page.droplets.isPresent()).toBe(true);
          })
        });
      });
    });
  });

  it('should set the video url', function() {
    page.wizardStart.click().then(function() {
      page.wizard_create_video.click()
      .then(function() {
        browser.sleep(500);
        page.itemTitle.sendKeys('The title');
        page.videoUrl.sendKeys('https://vimeo.com/121901153')
        .then(function() {
          page.startVideoTaggingButton.click()
          .then(function() {
            expect(page.droplets.isPresent()).toBe(true);
          })
        });
      });
    });
  });

  it('should add a droplet', function() {
    page.wizardStart.click().then(function() {
      page.wizard_create_image.click()
      .then(function() {
        browser.sleep(500);
        page.itemTitle.sendKeys('The title');
        //page.imageUrl.sendKeys('https://placeholdit.imgix.net/~text?txtsize=400&txt=XYZ&w=800&h=800&txttrack=0')
        page.imageUrl.sendKeys('http://localhost:9000/img/assets/1024x1024.png')
        .then(function() {
          browser.sleep(500);
          page.startImageTaggingButton.click()
          .then(function() {
            expect(page.droplets.isPresent()).toBe(true);
            expect(page.dropletsDrag.get(1).isPresent()).toBe(true);
            expect(page.dropletsDrag.count()).toBe(6);
            expect(page.wizardDropzone.isPresent()).toBe(true);

            page.wizardDropzone.getLocation()
            .then(function(location) {
              browser.actions().dragAndDrop(page.dropletsDrag.get(1), {x: location.x - 40, y: location.y - 40}).perform();
              browser.actions().dragAndDrop(page.dropletsDrag.get(2), {x: location.x - 40, y: location.y}).perform();
              browser.actions().dragAndDrop(page.dropletsDrag.get(3), {x: location.x - 40, y: location.y + 40}).perform();
              browser.actions().dragAndDrop(page.dropletsDrag.get(4), {x: location.x - 40, y: location.y + 80}).perform();

              return browser.actions().dragAndDrop(page.dropletsDrag.get(5), {x: location.x - 40, y: location.y + 120}).perform();
            })
            //.then(function() {
            //  browser.sleep(500);
            //  browser.pause();
            //});
          })
        });
      });
    });
  });


  //it('should select a hotspot product for video shoppables', function() {
  //  browser.get('/tagging');
  //  page.wizardStart.click().then(function() {
  //    browser.sleep(500);
  //    expect(page.wizardOverlay.isPresent()).toBe(true);
  //    expect(page.wizard_create_video.isPresent()).toBe(true);
  //    page.wizard_create_video.click()
  //    .then(function() {
  //      browser.sleep(500);
  //      expect(page.videoUrl.isPresent()).toBe(true);
  //      page.videoUrl.sendKeys('https://youtu.be/pXvGbOThFwc')
  //      //page.videoUrl.sendKeys('http://www.thepublisherswebsite.com/wp-content/uploads/2014/10/fauxfur_styling.jpg')
  //      //page.videoUrl.sendKeys('http://localhost:9000/public//551e335f41e8462e603c05ab.png')
  //      //page.videoUrl.sendKeys('https://vimeo.com/121901153')
  //      .then(function() {
  //        //page.wizard_create_video.element('.sct-error')
  //        page.nextButton.click()
  //        .then(function() {
  //          expect(page.stepVideoAdd.isPresent()).toBe(true);
  //          var productSelector = page.stepVideoAdd.element(by.css('.sct-product-selector .sct-button'))
  //          expect(productSelector.isPresent()).toBe(true);
  //          browser.sleep(500);
  //          // show product selector overlay
  //          productSelector.click()
  //          .then(function() {
  //            browser.sleep(1000);
  //            expect(page.productOverlay.isPresent()).toBe(true);
  //            expect(page.productPanel.isPresent()).toBe(true);
  //            expect(page.products.count()).toBeGreaterThan(1);
  //            // select first product in product overlay
  //            page.products.get(0).click().then(function() {
  //              browser.sleep(500);
  //              // product drag and drop to create hotspot
  //              browser.actions().
  //                dragAndDrop(page.dropletsDrag.get(0), page.stepVideoDropzone)
  //                .perform()
  //                .then(function() {
  //                  browser.sleep(500);
  //                  browser.pause();
  //                });

  //            });
  //          });
  //        });
  //      });
  //    });
  //  });
  //});

  //it('should select a hotspot product for video shoppables', function() {
  //  browser.get('/tagging');
  //  page.wizardStart.click().then(function() {
  //    browser.sleep(500);
  //    expect(page.wizardOverlay.isPresent()).toBe(true);
  //    expect(page.wizard_create_video.isPresent()).toBe(true);
  //    page.wizard_create_video.click()
  //    .then(function() {
  //      browser.sleep(500);
  //      expect(page.videoUrl.isPresent()).toBe(true);
  //      page.videoUrl.sendKeys('https://youtu.be/pXvGbOThFwc')
  //      .then(function() {
  //        page.nextButton.click()
  //        .then(function() {
  //          expect(page.stepVideoAdd.isPresent()).toBe(true);
  //          var productSelector = page.stepVideoAdd.element(by.css('.sct-product-selector .sct-button'))
  //          expect(productSelector.isPresent()).toBe(true);
  //          browser.sleep(500);
  //          // show product selector overlay
  //          productSelector.click()
  //          .then(function() {
  //            browser.sleep(1000);
  //            expect(page.productOverlay.isPresent()).toBe(true);
  //            expect(page.productPanel.isPresent()).toBe(true);
  //            expect(page.products.count()).toBeGreaterThan(1);
  //            // select first product in product overlay
  //            page.products.get(0).click().then(function() {
  //              browser.sleep(500);
  //              // product drag and drop to create hotspot
  //              browser.actions().
  //                dragAndDrop(page.stepVideo_draggables.get(0), page.stepVideoAdd.element(by.css('.sct-droppable--area')))
  //                .perform()
  //                .then(function() {
  //                  browser.sleep(500);
  //                });
  //                // publish
  //                page.nextButton.click()
  //                .then(function() {
  //                  browser.pause();
  //                });
  //            });
  //          });
  //        });
  //      });
  //    });
  //  });
  //});

  //it('should select a hotspot product for image shoppables', function() {
  //  browser.get('/tagging');

  //  page.wizardStart.click().then(function() {
  //    expect(page.wizardOverlay.isPresent()).toBe(true);
  //    browser.sleep(500);
  //    page.wizard_create_image.click().then(function() {

  //      browser.sleep(500);
  //      expect(page.imageUrl.isPresent()).toBe(true);
  //      //page.imageUrl.sendKeys('http://www.thepublisherswebsite.com/wp-content/uploads/2015/01/winter-parkas1.jpg')
  //      //page.imageUrl.sendKeys('http://placehold.it/280x280')
  //      page.imageUrl.sendKeys('http://www.thepublisherswebsite.com/wp-content/uploads/2014/10/fauxfur_styling.jpg')
  //      .then(function() {
  //        page.nextButton.click()
  //        .then(function() {
  //          var productSelector = page.stepImageAdd.element(by.css('.sct-product-selector .sct-button'))
  //          expect(productSelector.isPresent()).toBe(true);
  //          browser.sleep(500);
  //          // show product selector overlay
  //          productSelector.click()
  //          .then(function() {
  //            browser.sleep(1500);
  //            expect(page.productOverlay.isPresent()).toBe(true);
  //            expect(page.productPanel.isPresent()).toBe(true);
  //            expect(page.products.count()).toBeGreaterThan(1);
  //            // select first product in product overlay
  //            page.products.get(0).click().then(function() {
  //              //browser.pause();
  //            });
  //          });
  //        });
  //      });

  //    });
  //  });
  //});

});
