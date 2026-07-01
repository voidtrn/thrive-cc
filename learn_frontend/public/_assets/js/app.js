(function ($) {

  'use strict';

  var $html = $('html');

  var isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  var global_functions = {
    init: function () {
      var self = this;

      self.header();
      self.accordion();
      self.stickyFix();
      self.popOver();
      self.modal();
      self.dropDown();
      self.navigation();

    },
    dropDown: function () {
      $('.header-extra__item .dropdown-menu').on('click', function (e) {
        e.stopPropagation();
      });
    },

    popOver: function () {
      $(function () {
        $('[data-toggle="popover"]').popover()
      });
      $('.popover-dismiss').popover({
        trigger: 'click'
      });
      $('#popover-notification').popover({
        trigger: 'click',
        placement: 'right',
        offset: 120,
        html: true,
        content: function () {
          return $('#notification-popover-container').html();
        },
        template: '<div class="popover notification-popover" role="tooltip"><div class="arrow"></div><div class="popover-body"></div></div>',
      })

      $('.triggerBackdrop').click(function () {
        $('.backdrop').toggleClass('backdrop--hide');
        $('body').toggleClass('backdrop--body');
      });

      $('[rel=pointpvr]').popover({
        trigger: 'hover',
        placement: 'right',
        html: true,
        content: function () {
          return $('#point-popover').html();
        },
        template: '<div class="popover belt-rank__popover-box"><div class="arrow"></div><div class="popover-body"></div></div>',
      })
      .on('shown', function () {
        $('[rel=pointpvr]').not(this).popover('hide');
      })

      $('[rel=yellow-belt]').popover({
          trigger: 'hover',
          placement: 'right',
          html: true,
          content: function () {
            return $('#belt-popover__container-yellow').html();
          },
          template: '<div class="popover belt-rank__popover-box"><div class="arrow"></div><div class="popover-body"></div></div>',
        })
        .on('shown', function () {
          $('[rel=yellow-belt]').not(this).popover('hide');
        })

      $('[rel=black-belt]').popover({
          trigger: 'hover',
          placement: 'right',
          html: true,
          content: function () {
            return $('#belt-popover__container-black').html();
          },
          template: '<div class="popover belt-rank__popover-box"><div class="arrow"></div><div class="popover-body"></div></div>',
        })
        .on('shown', function () {
          $('[rel=black-belt]').not(this).popover('hide');
        })

      $('[rel=green-belt]').popover({
          trigger: 'hover',
          placement: 'right',
          html: true,
          content: function () {
            return $('#belt-popover__container-green').html();
          },
          template: '<div class="popover belt-rank__popover-box"><div class="arrow"></div><div class="popover-body"></div></div>',
        })
        .on('shown', function () {
          $('[rel=green-belt]').not(this).popover('hide');
        })

      $('[rel=info-doubtful]').popover({
          trigger: 'hover',
          offset: '70',
          html: true,
          content: function () {
            return $('.info-doubtful__popover').html();
          },
          template: '<div class="popover question__popover-box"><div class="arrow"></div><div class="popover-body"></div></div>',
        })
        .on('shown', function () {
          $('[rel=info-doubtful]').not(this).popover('hide');
        })
    },

    stickyFix: function () {
      var stickySidebar = new Sticky('.stickySidebar');
    },

    accordion: function () {

      $('#accordionIcon').click(function () {
        $('.accordion-icon').toggleClass('accordion-icon--close');
        $('.accordion-content').toggleClass('accordion-content--close');
      });

      // $('#collapseOne').on('show.bs.collapse', function () {
      //   $('.modal__content-list').find('#card1').addClass('list__card--border-red')
      //   $('#card1').find('.card-header--toggle').addClass('card-header--toggle-down')
      // })
      // $('#collapseOne').on('hide.bs.collapse', function () {
      //   $('.modal__content-list').find('#card1').removeClass('list__card--border-red')
      //   $('#card1').find('.card-header--toggle').removeClass('card-header--toggle-down')
      // })

      // $('#collapseTwo').on('show.bs.collapse', function () {
      //   $('.modal__content-list').find('#card2').addClass('list__card--border-red')
      //   $('#card2').find('.card-header--toggle').addClass('card-header--toggle-down')
      // })
      // $('#collapseTwo').on('hide.bs.collapse', function () {
      //   $('.modal__content-list').find('#card2').removeClass('list__card--border-red')
      //   $('#card2').find('.card-header--toggle').removeClass('card-header--toggle-down')
      // })

      // $('#collapseThree').on('show.bs.collapse', function () {
      //   $('.modal__content-list').find('#card3').addClass('list__card--border-red')
      //   $('#card3').find('.card-header--toggle').addClass('card-header--toggle-down')
      // })
      // $('#collapseThree').on('hide.bs.collapse', function () {
      //   $('.modal__content-list').find('#card3').removeClass('list__card--border-red')
      //   $('#card3').find('.card-header--toggle').removeClass('card-header--toggle-down')
      // })

      // $('#collapseFour').on('show.bs.collapse', function () {
      //   $('.modal__content-list').find('#card4').addClass('list__card--border-red')
      //   $('#card4').find('.card-header--toggle').addClass('card-header--toggle-down')
      // })
      // $('#collapseFour').on('hide.bs.collapse', function () {
      //   $('.modal__content-list').find('#card4').removeClass('list__card--border-red')
      //   $('#card4').find('.card-header--toggle').removeClass('card-header--toggle-down')
      // })

      // $('#collapseFive').on('show.bs.collapse', function () {
      //   $('.modal__content-list').find('#card5').addClass('list__card--border-red')
      //   $('#card5').find('.card-header--toggle').addClass('card-header--toggle-down')
      // })
      // $('#collapseFive').on('hide.bs.collapse', function () {
      //   $('.modal__content-list').find('#card5').removeClass('list__card--border-red')
      //   $('#card5').find('.card-header--toggle').removeClass('card-header--toggle-down')
      // })


    },

    modal: function () {
      $('.btn__operator').on('click', function () {
        let $button = $(this);
        let oldValue = $button.parent().parent().find('input').val();
        let newValue = 0;

        if ($button.val() == '+') {
          newValue = parseFloat(oldValue) + 1;
        } else {
          // Don't allow decrementing below zero
          if (oldValue > 0) {
            newValue = parseFloat(oldValue) - 1;
          } else {
            newValue = 0;
          }
        }
        $button.parent().parent().find('input').val(newValue);
      });
    },

    navigation: function () {
      $(function () {
        var current = location.pathname;
        $('.menu a').each(function () {
          var $this = $(this);
          // if the current path is like this link, make it active
          if ($this.attr('href').indexOf(current) !== -1) {
            $this.addClass('active');
          }
        })
      });
    },

    header: function () {
      $('#triggerMenuBurger').click(function () {
        $('.header').addClass('header--show');
      });
      $('#triggerMenuBurgerClose').click(function () {
        $('.header').removeClass('header--show');
      });

      if (window.matchMedia('(max-width: 1024px)').matches) {
        $('.header').toggleClass('header--scroll');
      }
    }
  };

  $(document).ready(function () {
    global_functions.init();
  });

})(jQuery);