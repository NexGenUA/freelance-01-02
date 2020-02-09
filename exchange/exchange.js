$(document).ready(function($) {
  $('input[name="yousend"]').mask('99999999999.00');
  $('input[name="yousend"]').on('focusout', function() {
    
    var value = $(this).val()
    if(value === '') {
      $(this).focus();
      $(this).val('10.00');
      $(this).trigger('input');
      return false;
    } else if (value.indexOf('.') === value.length - 1 || +value === 0) {
      if (+value.slice(0, -1) === 0 || +value === 0) {
        $(this).focus();
        $(this).val('10.00');
        $(this).trigger('input');
        return false;
      }
      value = value + '00'
      $(this).val(value);
    }
    if (!~value.indexOf('.')) {
      value = value + '.00';
      $(this).val(value);
    }
  });

  $('input[name="yousend"]').on('input', function() {
    var value = $(this).val()
    value = value.replace(/^[0]+/, '');
    if (value.indexOf('.') === 0) value = 0 + value;
    $(this).val(value)
  });
  
  $('input[name="yousend"], select[name="currency"], select[name="currency_purse"]').on('input', function() {
    exchangeThrottle();
  })

  function exchange() {
    var currency = $('select[name="currency"]').val();
    var currency_purse = $('select[name="currency_purse"]').val();
    var idx = currency_purse.lastIndexOf('-') + 1;
    currency_purse = currency_purse.slice(idx);
    var value = $('input[name="yousend"]').val();
    value = !value || value === '.' ? 0 : value;
    var krypta = /dash|btc|ltc|eth/i.test(currency_purse);
    var rateUrl = 'rate.php';

    $.ajax({
      type: "POST",  
      dataType: 'json',
      data: { currency, currency_purse, value, krypta },
      url: rateUrl,
      success: function(data) {
        $('input[name="youget"]').val(data.Value);
      },
      error: function(err) {
        console.log(0);
      }
    });
  }

  function throttle(func, ms) {

    var isThrottled = false;

    function wrapper() {

      if (isThrottled) return;

      func();

      isThrottled = true;

      setTimeout(function() {
        isThrottled = false;
        func();      
      }, ms);
    }

    return wrapper;
  }

  var exchangeThrottle = throttle(exchange, 500);

  exchangeThrottle();
  
})
