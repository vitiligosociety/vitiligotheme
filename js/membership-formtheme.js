;;

(function (CRM, $) {
  return $(function () {

    ;;

    // The config placeholder here is replaced by php. Do not alter the line below at all.

    var payment_processor_ids = {}; //%config%
    console.log(payment_processor_ids);

    var $form = $('form#Main');
    if (!$form.length) {
      return;
    }

    var $niceForm = $('<div/>');

    $form.prepend($niceForm);

    function parseStdCiviField(selector) {
      var $rowNode = $form.find(selector).hide();

      var rtn = {
        label: $rowNode.find('div.label label'),
        input: $rowNode.find('div.content input')
      };
      if (rtn.input.length === 0) {
        rtn.input = $rowNode.find('div.content textarea');
      }
      return rtn;
    }
    function parseSelect2CiviField(selector) {
      var $rowNode = $form.find(selector).hide();
      var $select = $rowNode.find('select').select2('destroy').removeClass('crm-select2 crm-chain-select-target crm-form-select').addClass('vt-select');
      return {
        label: $rowNode.find('div.label label'),
        input: $('<div class="vt-select-container"/>').append($select)
      };
    }
    function parseComplexCiviField(selector) {
      var $rowNode = $form.find(selector).hide();
      return {
        label: $rowNode.find('div.label label'),
        input: $rowNode.find('div.content').removeClass('content')
      };
    }
    function parseRadiosIntoSelect(selector) {
      var $rowNode = $form.find(selector).hide();
      var $select = $('<select class="vt-select" />');
      $select.append($('<option value="">--Please select--</option>').on('click', function () {
        $rowNode.find('input:checked').prop('checked', false);
      }));
      $rowNode.find('input[type="radio"]').each(function () {
        var $originalInput = $(this);
        $option = $('<option/>').attr('value', this.value).text($originalInput.next('label').text()).on('click', function (e) {
          e.preventDefault();$originalInput.click();
        });
        $select.append($option);
      });

      var $selectFix = $('<div class="vt-select-container" />').append($select);
      return {
        label: $rowNode.find('div.label label'),
        input: $selectFix
      };
    }
    function createStdFields($label, fields) {
      var $container = $('<div class="vt-container vt-grid1"></div>');

      if ($label) {
        $container.append($('<div class="vt-label vt-col-1 vt-colspan-1"></div>').append($label));
      }

      if (fields.length === 1) {
        $container.append($('<div class="vt-input vt-col-2-span-2"></div>').append(fields[0]));
      } else if (fields.length === 2) {
        $container.append($('<div class="vt-input vt-col-2"></div>').append(fields[0]));
        $container.append($('<div class="vt-input vt-col-3"></div>').append(fields[1]));
      } else {
        console.error("fields must be 1 or two big.", fields);
      }
      $niceForm.append($container);
    }

    function yourInformation() {
      var a, b;
      $niceForm.append('<div class="vt-your-info"><h2>Your information</h2><span>*Required fields</span></div>');

      // Add name fields.
      var first_name = parseStdCiviField('#editrow-first_name');
      first_name.label.text('Full Name');
      first_name.input.attr('placeholder', 'First name');
      var last_name = parseStdCiviField('#editrow-last_name');
      last_name.input.attr('placeholder', 'Last name');
      createStdFields(first_name.label, [first_name.input, last_name.input]);

      // Add email
      var email = parseStdCiviField('#editrow-email-1');
      email.input.attr('placeholder', 'Email');
      createStdFields(email.label, [email.input]);

      // Add phone
      var phone = parseStdCiviField('#editrow-phone-Primary-1');
      phone.input.attr('placeholder', 'Phone number');
      phone.label.text('Phone number');
      createStdFields(phone.label, [phone.input]);

      // address.
      $niceForm.append('<hr/>');
      a = parseStdCiviField('#editrow-street_address-Primary');
      a.label.text('Your address');
      a.input.attr('placeholder', 'Address line 1*');
      createStdFields(a.label, [a.input]);
      // ...
      a = parseStdCiviField('#editrow-supplemental_address_1-Primary');
      a.input.attr('placeholder', 'Address line 2*');
      createStdFields(null, [a.input]);
      // ...
      a = parseStdCiviField('#editrow-city-Primary');
      a.input.attr('placeholder', 'Town/City');
      b = parseSelect2CiviField('#editrow-state_province-Primary');
      createStdFields(null, [a.input, b.input]);
      // ...
      a = parseStdCiviField('#editrow-postal_code-Primary');
      a.input.attr('placeholder', 'Postcode*');
      b = parseSelect2CiviField('#editrow-country-Primary');
      // b.input.find('select').select2('destroy');
      createStdFields(null, [a.input, b.input]);

      $niceForm.append('<hr/>');
      // DOB
      a = parseComplexCiviField('#editrow-birth_date');
      a.input.find('.crm-clear-link').hide();
      createStdFields(a.label, [a.input, null]);

      // Ethnicity
      a = parseSelect2CiviField('#editrow-custom_14');
      b = parseStdCiviField('#editrow-custom_15');
      b.input.attr('placeholder', 'Other'); // Q. how to be reactive to an existing select2 element? @todo
      createStdFields(a.label, [a.input, b.input]);

      a = parseRadiosIntoSelect('#editrow-gender_id');
      createStdFields(a.label, [a.input, null]);

      // Do you have Vitiligo.
      a = parseRadiosIntoSelect('#editrow-custom_16');
      createStdFields(a.label, [a.input, null]);
    }
    function membershipAmountButtons() {
      var a, b;
      var $priceset = $('#priceset').hide();
      var map = [['#price_7_a', '£50'], ['#price_7_7', '£25'], ['#price_7_b', '£100'], ['#price_7_c', '£200'], ['#price_7_d', '£500']];
      var $container = $('<div class="vt-container vt-amount-buttons"></div>');
      map.forEach(function (m) {
        $container.append($('<div class="vt-amount-buttons__button"></div>').append($('<button/>').text(m[1]).on('click', function (e) {
          e.preventDefault();
          $(m[0]).click();
          $(this).addClass('selected').parent().siblings().find('button').removeClass('selected');
        })));
      });

      $niceForm.append('<h3 class="vt-heading">My contribution</h3>');
      $niceForm.append($container);
      $niceForm.append('<div>Annual membership renews automatically, can be cancelled upto 14 days before renewal date</div>');
      $niceForm.append('<hr/>');
    }
    function whyJoining() {
      var a, b;
      a = parseStdCiviField('#editrow-custom_17');
      a.label.html("<h3 class='vt-heading'>Why are you signing up to membership with the Vitiligo Society?</h3>");
      $niceForm.append($('<div class="vt-container"/>').append(a.label, a.input), '<hr/>');
    }
    function paymentDetails() {
      var $originalInput = $form.find("fieldset.payment_options-group").hide();

      var $paymentDetails = $('<div class="vt-payment-box"/>');
      var $header = $('<div class="vt-payment-box__header">\n      <h3 class="vt-payment-box__heading">Your payment details</h3>\n      <div class="vt-payment-box__payby">Pay by:</div>\n      <div class="vt-payment-box__switch-container">\n        <div class="vt-payment-box__switch-wrapper">\n          <label class="vt-payment-box__dd" for="CIVICRM_QFID_11_payment_processor_id">Direct Debit</label>\n          <label class="vt-payment-box__c" for="CIVICRM_QFID_9_payment_processor_id">Card</label>\n        </div>\n      </div>\n      ');
      var $content = $('<div class="vt-payment-box__content"/>');
      $paymentDetails.append($header, $content);
      $content.append($form.find('#billing-payment-block'));
      var $wrapper = $header.find('.vt-payment-box__switch-wrapper');

      function selectPaymentMethod() {
        var selected_processor_id = $originalInput.find('input:checked').val();
        console.log("selectPaymentMethod running ", selected_processor_id);
        if (payment_processor_ids.GoCardless.indexOf(selected_processor_id) > -1) {
          $wrapper.addClass('selected-dd').removeClass('selected-c');
        } else {
          $wrapper.addClass('selected-c').removeClass('selected-dd');
        }
      }

      $originalInput.find('input').on('click', selectPaymentMethod);
      $wrapper.find('label').on('click', selectPaymentMethod);
      $niceForm.append($paymentDetails);
      selectPaymentMethod();
    }
    function giftAid() {
      //editrow-custom_10
      var $gaRow = $('#editrow-custom_10');
      var $inputs = $gaRow.find('input');
      var $yes = $inputs.eq(0);
      var $yes_label = $yes.next();
      var $no = $inputs.eq(1);
      var $no_label = $no.next();
      var $helpRow = $('#helprow-custom_10>div');
      var $intro = $helpRow.find('>p').slice(3, 5);
      var $declaration = $helpRow.find('p').eq(0).add($helpRow.find('ol').eq(0));

      // Now re-assemble.
      var $container = $('<div class="vt-container"></div>');
      $container.append('<h3 class="vt-heading">Gift Aid</h3>', $intro);
      // Now the grid layout
      var $layout = $('<div class="vt-giftaid-layout-1"/>');
      var $inputs_container = $('<div class="vt-giftaid-inputs" />');
      $inputs_container.append($yes, $yes_label, $no, $no_label);
      $layout.append($inputs_container, $('<div class="vt-giftaid-declaration"/>').append($declaration));
      $container.append($layout);
      $niceForm.append($container, '<hr/>');
    }

    membershipAmountButtons();
    yourInformation();
    whyJoining();
    paymentDetails();
    giftAid();
    return;

    // Create UK radios.
    function updateUi() {
      if ($inUK.is(":checked")) {
        // Show all options.
        $payment_processor.fadeIn('fast');
        // Nudge user to GoCardless.
        selectPaymentProcessor('GoCardless');
        updatePaymentProcessorNames('Direct Debit - more of your money goes to the Vitiligo Society', 'Recurring credit/debit card payment');
      } else {
        // Select Stripe.
        $payment_processor.hide(); // Normally hidden anyway, but just in case user changes mind on UKness.
        // Force user to use Stripe; GC not relevant outside UK.
        selectPaymentProcessor('Stripe');
        updatePaymentProcessorNames('', 'Recurring credit/debit card payment');
      }
    }

    /**
     * Find and click the input for either 'stripe' or 'gocardless' payment
     * processor based on configured Payment Processor Ids.
     */
    function selectPaymentProcessor(processorType) {
      var found;
      var processorIds = payment_processor_ids[processorType] || [];

      $payment_processor.find('[name="payment_processor_id"]').each(function () {
        var m = this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
        if (m && m.length === 2 && processorIds.indexOf(m[1]) > -1) {
          found = this;
        }
      });

      $(found).trigger('click');
    }
    /**
     * Update hints on the processor names.
     */
    function updatePaymentProcessorNames(gcText, stripeText) {
      $payment_processor.find('[name="payment_processor_id"]').each(function () {
        var m = this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
        if (m && m.length === 2) {
          // Got processor ID. Is it stripe or GoCardless?
          if (payment_processor_ids.GoCardless.indexOf(m[1]) > -1) {
            // GoCardless.
            $(this).next().text(gcText);
          } else if (payment_processor_ids.Stripe.indexOf(m[1]) > -1) {
            // Stripe.
            $(this).next().text(stripeText);
          }

          if ($(this).next().next().prop('tagName') !== 'BR') {
            // Insert line break before input.
            $(this).next().next().before('<br/>');
          }
        }
      });
    }

    // Copy CiviCRM's default HTML structure.
    var $container = $('<div/>').addClass('crm-public-form-item crm-section');
    $container.append($('<div/>').addClass('label'));
    var $div = $('<div/>').addClass('content').appendTo($container);
    $container.append($('<div/>').addClass('clear'));

    var $inUK = $('<input/>').attr({ id: 'in-uk-yes', value: '1', name: 'in-uk', type: 'radio' }).on('click', updateUi).appendTo($div);
    $('<label/>').attr('for', 'in-uk-yes').text("I'm in the UK").appendTo($div);
    var $notInUK = $('<input/>').attr({ id: 'in-uk-no', value: '0', name: 'in-uk', type: 'radio' }).on('click', updateUi).appendTo($div);
    $('<label/>').attr('for', 'in-uk-no').text("I'm not in the UK").appendTo($div);

    var $payment_options = $form.find('.payment_options-group');
    var $payment_processor = $payment_options.find('.payment_processor-section');
    $payment_processor.hide().before($container);

    // Finally, we need to override CiviCRM's events on the price set selection.
    function overridePriceSetShowHide() {
      if (!$inUK.is(':checked') && !$notInUK.is(':checked')) {
        // Neither UK nor not UK is checked, so hide the other options for now.
        $payment_processor.hide();
      }
    }
    // Apply this when the price set is clicked.
    $('.price-set-option-content input[type="radio"]').on('click', function () {
      overridePriceSetShowHide();
      // In case we are not called first, repeat this after giving 50ms for other processes to work.
      setTimeout(overridePriceSetShowHide, 50);
    });
  });
})(CRM, CRM.$);
//# sourceMappingURL=membership-formtheme.js.map
