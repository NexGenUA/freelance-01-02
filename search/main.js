$(document).ready(function($){
  $('select[name=payment-method]').on('change', function() {
    var select = $(this).val();
    var placeholderValue = {
      'Paypal': '111111111',
      'Bitcoin': '22222222222',
      'Litecoin': '33333333',
      'Webmoney': '44444444444',
      'DASH': '55555555',
      'Perfect Money': '666666666',
      'Advanced Cash': '7777777777777'
    };
    
    $('input[name=payment-wallet]').attr( 'placeholder', placeholderValue[select])
      
    switch (select) {
      case 'Bitcoin': {
        removeSelects();
        addSelect('BTC', 'btc')
        break;
      } 
      case 'Litecoin': {
        removeSelects();
        addSelect('LTC', 'ltc')
        break;
      }
      case 'DASH': {
        removeSelects();
        addSelect('DASH', 'dash')
        break;
      }
      default: {
        removeSelects();
        addSelect('USD', 'usd');
        addSelect('EUR', 'eur');
      }
    }
    
    $('.currency-payment').html($('select[name=payment-currency]').val());
    $('.payment-method').html(select);
  })
  
  $('select[name=payment-currency]').on('change input', function() {
    var select = $(this).val();
    $('.currency-payment').html(select);
  })
  
  $('select[name=currency]').on('change', function() {
    $('#currency').html($(this).val());
    $('#currency-main').html($(this).val()); 
  })
  
  $('input[name="pin"]').mask('0000 0000 0000 0000');
  
  $('input[name="pin"]').on('blur keyup', function() {

    if (event.type === 'blur') { 
      var leng_pin = +$(this).val().length;

      if(leng_pin < 19 && leng_pin > 0) $(this).next('p').html('key указан не верно, пример: 1234 5678 9012 3456');
  
      if(leng_pin < 1) $(this).next('p').html('This field is required');
      
      $(this).attr('placeholder', $(this).data('placeholder'));
    }

    if (event.type === 'keyup') $(this).next('p').html('');
  });

  $('input[name="email"]').on('blur keyup', function() {

    if (event.type === 'blur') { 
      var leng_email = +$(this).val().length;
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (leng_email < 1) {
        $(this).next('p').html('This field is required');
      } else if (!regex.test($(this).val())) {
        $(this).next('p').html('E-mail entered incorrectly');
      }
      
      $(this).attr('placeholder', $(this).data('placeholder'));
    }

    if (event.type === 'keyup') $(this).next('p').html('');
  });

  $('input[name="payment-wallet"]').on('blur keyup', function() {

    if (event.type === 'blur') { 
      var leng_pw = +$(this).val().length;
      
      if (leng_pw < 1) {
        $(this).next('p').html('This field is required');
        $(this).attr('placeholder', $(this).data('placeholder'));
      }
    }

    if (event.type === 'keyup') $(this).next('p').html('');
  });

  $('input[name="pin"], input[name="email"], input[name="payment-wallet"]').on('focus', function () {
    $(this).data('placeholder', $(this).attr('placeholder'));
    $(this).removeAttr('placeholder');
  });
  
  $('input[name="payment-wallet"], input[name="email"]').keydown(function(e) {
    if (e.which === 32) e.preventDefault();
  })
  
  $('input[name="value"]').mask('99999999999.00');
  $('input[name="value"]').on('focusout', function() {
    
    var value = $(this).val();
    if(value === '') {
      $(this).focus();
      $(this).val('10.00');
      return false;
    } else if (value.indexOf('.') === value.length - 1 || +value === 0) {
      if (+value.slice(0, -1) === 0 || +value === 0) {
        $(this).focus();
        $(this).val('0.00');
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
  
  $('input[name="value"]').on('input', function() {
    var value = $(this).val();
    if (value.indexOf('.') === 0) value = 0 + value;
    $(this).val(value);
  });

  $('select[name="payment-method"], select[name="payment-currency"], select[name=currency], input[name="value"]').on('change', function() {
    exchangeRate()
  })
  
  $('form').on('submit', function(event) {
    
    $('input[name="pin"], input[name="payment-wallet"], input[name="email"]').focus().blur();
    
    var validate = true;
    
    $('.validate').each(function(i, el){
      if ($(el).text().trim() !== '') {
        validate = false;
        return false;
      }
    })

    if (!validate) event.preventDefault();
    
  })
  
  function addSelect(cur, value) {
    $('select[name="payment-currency"]').prepend('<option value="' + value + '">' + cur + '</option>')
  } 
  
  function removeSelects() {
    $('select[name="payment-currency"] option').remove();
  }
  
  var noUpdate = false;
  var noSend = false;

  function exchangeRate() {
    var currency = $('select[name="currency"]').val();
    var currency_purse = $('select[name="payment-currency"]').val();
    var value = $('input[name="value"]').val();
    var krypta = /dash|btc|ltc|eth/i.test(currency_purse);
    var allRateUrl = 'http://prosgold.ru/rate-all.php';
    var rateUrl = 'http://prosgold.ru/rate.php';
    
       

    if (noSend) return;

    $.ajax({
      type: "POST",  
      dataType: 'json',
      data: { currency, currency_purse },
      url: allRateUrl,
      success: function(data) {
        $('#all-rate').text(data.Value);
      },
      error: function(err) {
        console.log(0);
      }
    });

    $.ajax({
      type: "POST",  
      dataType: 'json',
      data: { currency, currency_purse, value, krypta },
      url: rateUrl,
      success: function(data) {
        $('#rate').text(data.Value);
      },
      error: function(err) {
        console.log(0);
      }
    });

    if (noUpdate) {
      return;
    }

    pushHistory();

  }
  
  function pushHistory() {
    setTimeout(function() {
      var from = $('select[name="currency"]').val().toLowerCase();    
      var to = $('select[name="payment-currency"]').val().toLowerCase();;
      var method = $('select[name="payment-method"]').val().toLowerCase().split(' ').join('-');
      var url = 'index.php?exchange-moynkey-' + from + '-to-' + method + '-' + to;
      setHistory(url);
    }, 0)
  }

  function setHistory(url) {
    var state;
    state = {
      url: url
    };
    history.pushState(state, '', state.url);
  }

  function setValues(state) {
    if  (!state) return;
    var history = state.url.split('-');
    var length = history.length;
    if (length < 6 || length > 7) {
      pushHistory();
      return;
    }
    var validate = {
      'from': ['eur', 'usd', 'chf'],
      'Paypal': ['eur', 'usd'],
      'Webmoney': ['eur', 'usd'],
      'Perfect Money': ['eur', 'usd'],
      'Advanced Cash': ['eur', 'usd'],
      'Bitcoin': ['btc'],
      'Litecoin': ['ltc'],
      'DASH': ['dash']
    };
    var from = history[2];
    var method = length === 6 ? history[4][0].toUpperCase() + history[4].slice(1)
      : history[4][0].toUpperCase() + history[4].slice(1)
      + ' ' + history[5][0].toUpperCase() + history[5].slice(1);
    method = method === 'Dash' ? 'DASH' : method;
    var to = history[length - 1];
    var wrongUrl = true;

    for (var key in validate) {
      if (key === method 
        && validate[key].indexOf(to) !== -1 
        && validate.from.indexOf(from) !== -1) {

        $('select[name="currency"]').val(from);
        $('select[name="payment-method"]').val(method);
        $('select[name="payment-method"]').trigger('change');
        $('select[name="payment-currency"]').val(to);
        wrongUrl = false;
      }
    }

    noSend = true;
    
    if (wrongUrl) {
      noSend = false;
      pushHistory();
      return;
    }

    setTimeout(function() { noSend = false }, 0)
    updateValue();
  }

  function updateValue() {
    $('.currency-payment').html($('select[name=payment-currency]').val());
    $('.payment-method').html($('select[name=payment-method]').val());
    $('select[name=currency]').trigger('change');
  }

  $(window).on('popstate', function(e) {
    noUpdate = true;
    setTimeout(function() { noUpdate = false }, 0)
    setValues(e.originalEvent.state);
    updateValue();
  })

  var state = {
    url: window.location.search
  }
  
  setValues(state);
  updateValue();

})
