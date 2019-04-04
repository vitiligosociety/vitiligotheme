;;

(function (CRM, $) {
  return $(function () {

    ;;

    // The config placeholder here is replaced by php. Do not alter the line below at all.

    var payment_processor_ids = {}; //%config%

    var $form = $('form#Main');
    if (!$form.length) {
      return;
    }

    var $niceForm = $('<div/>');

    $form.prepend($niceForm);

    function parseStdCiviField(selector) {
      var $rowNode = $form.find(selector).hide();

      return {
        label: $rowNode.find('div.label label'),
        input: $rowNode.find('div.content input')
      };
    }
    function parseSelectCiviField(selector) {
      var $rowNode = $form.find(selector).hide();
      return {
        label: $rowNode.find('div.label label'),
        input: $rowNode.find('div.content').removeClass('content')
      };
    }
    function createStdFields($label, fields) {
      var $container = $('<div class="vt-container vt-grid1"></div>');

      if ($label) {
        $container.append($('<div class="vt-label vt-col-1 vt-colspan-1"></div>').append($label));
      }

      if (fields.length === 1) {
        $container.append($('<div class="vt-input vt-col-2-span-2"></div>').append(fields[0]));
      }
      if (fields.length === 2) {
        $container.append($('<div class="vt-input vt-col-2"></div>').append(fields[0]));
        $container.append($('<div class="vt-input vt-col-3"></div>').append(fields[1]));
      } else {
        console.error("fields must be 1 or two big.");
      }
      $niceForm.append($container);
    }

    function yourInformation() {
      var a, b;

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
      b = parseSelectCiviField('#editrow-state_province-Primary');
      createStdFields(null, [a.input, b.input]);
      // ...
      a = parseStdCiviField('#editrow-postal_code-Primary');
      a.input.attr('placeholder', 'Postcode*');
      b = parseSelectCiviField('#editrow-country-Primary');
      createStdFields(null, [a.input, b.input]);

      $niceForm.append('<hr/>');
      // DOB
      a = parseSelectCiviField('#editrow-birth_date');
      a.input.find('.crm-clear-link').hide();
      createStdFields(a.label, [a.input, null]);

      // Ethnicity
      a = parseSelectCiviField('#editrow-custom_14');
      b = parseStdCiviField('#editrow-custom_15');
      b.input.attr('placeholder', 'Other'); // Q. how to be reactive to an existing select2 element? @todo

      // Gender, Do you have Vitiligo @todo these need transforming from radio buttons to selects!
    }

    yourInformation();
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
