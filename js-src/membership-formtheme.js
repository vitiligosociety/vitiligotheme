((CRM, $) => $(() => {

'use strict';

  $('body').addClass('vitiligo-theme-civicrm-page');

  // The config placeholder here is replaced by php. Do not alter the line below at all.
  var payment_processor_ids = {};//%config%
  var form_name = '';//%formname%

  var $form = $('form#Main');
  if (!$form.length) {
    return;
  }

  const $niceForm = $('<div/>');
  $form.prepend($niceForm);

  function parseStdCiviField(selector) {
    var $rowNode = $form.find(selector).hide();

    const rtn = {
      label: $rowNode.find('div.label label'),
      input: $rowNode.find('div.content input'),
    };
    if (rtn.input.length === 0) {
      rtn.input = $rowNode.find('div.content textarea');
    }
    return rtn;
  }
  function parseSelect2CiviField(selector) {
    var $rowNode = $form.find(selector).hide();
    var $select = $rowNode.find('select');
    return {
      label: $rowNode.find('div.label label'),
      input: killSelect2($select)
    };
  }
  function killSelect2($select) {
    return $('<div class="vt-select-container"/>').append(
      $select.select2('destroy').removeClass('crm-select2 crm-chain-select-target crm-form-select').addClass('vt-select')
    );
  }
  function parseComplexCiviField(selector) {
    var $rowNode = $form.find(selector).hide();
    return {
      label: $rowNode.find('div.label label'),
      input: $rowNode.find('div.content').removeClass('content'),
    };
  }
  function parseRadiosIntoSelect(selector) {
    var $rowNode = $form.find(selector).hide();
    const $select = $('<select class="vt-select" />');
    $select.append(
      $('<option value="">--Please select--</option>')
      .on('click', function() { $rowNode.find('input:checked').prop('checked', false); }));
    $rowNode.find('input[type="radio"]').each(function() {
      const $originalInput = $(this);
      $option = $('<option/>').attr('value', this.value).text($originalInput.next('label').text())
      .on('click', e => { e.preventDefault(); $originalInput.click(); } );
      $select.append($option);
    });

    const $selectFix = $('<div class="vt-select-container" />').append($select);
    return {
      label: $rowNode.find('div.label label'),
      input: $selectFix,
    };
  }
  function createStdFields($label, fields, $appendTo) {
    const $container = buildStdContainer($label, fields);
    $niceForm.append($container);
  }
  function buildStdContainer($label, fields) {
    const $container = $('<div class="vt-container vt-grid1"></div>');

    if ($label) {
      $container.append($('<div class="vt-label vt-col-1 vt-colspan-1"></div>').append($label));
    }

    if (fields.length === 1) {
      $container.append($('<div class="vt-input vt-col-2-span-2"></div>').append(fields[0]));
    }
    else if (fields.length === 2) {
      $container.append($('<div class="vt-input vt-col-2"></div>').append(fields[0]));
      $container.append($('<div class="vt-input vt-col-3"></div>').append(fields[1]));
    }
    else {
      console.error("fields must be 1 or two big.", fields);
    }
    return $container;
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
    var email = parseStdCiviField('#editrow-email-1, #editrow-email-Primary');
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
    createStdFields(null, [a.input, b.input]);
    // We also need to hook up the country selector to the payment selector logic.
    b.input.find('select').on('change', alterPaymentMethodsAvailable);


    $niceForm.append('<hr/>');
    // DOB
    a = parseComplexCiviField('#editrow-birth_date');
    a.input.find('.crm-clear-link').hide();
    createStdFields(a.label, [a.input, null]);

    // Ethnicity
    var ethnicitySelect = parseSelect2CiviField('#editrow-custom_14');
    var ethnicityOther = parseStdCiviField('#editrow-custom_15');
    function showHideEthnicityOther() {
      if (ethnicitySelect.input.find('select').val() == 18) {
        ethnicityOther.input.show();
      }
      else {
        ethnicityOther.input.hide().find('input').val("");
      }
    }
    ethnicitySelect.input.on('change', showHideEthnicityOther);
    ethnicityOther.input.attr('placeholder', 'Other');
    createStdFields(ethnicitySelect.label, [ethnicitySelect.input, ethnicityOther.input]);
    showHideEthnicityOther();

    a = parseRadiosIntoSelect('#editrow-gender_id');
    createStdFields(a.label, [a.input, null]);

    // Do you have Vitiligo.
    a = parseRadiosIntoSelect('#editrow-custom_16');
    createStdFields(a.label, [a.input, null]);

  }
  function donateAmountLayout() {
    const $container = $('<div class="vt-container vt-donation-layout"></div>');
    const $amount = $('<div class="vt-donation-amount-wrapper"></div>');
    const $blurb = $(`<div class="vt-donation-amount-blurb">
      <div class="vt-donation-amount-blurb-header">
        <div class="vt-donation-blurb-title">
          <i class="vt-icon vt-icon--member"></i>
          Membership is the best way to support us
        </div>
        <a class="vt-donation-blurb-readmore" href="/membership" >Read more</a>
      </div>
      <div class="vt-donation-amount-blurb-text">
        <p>We are grateful for all contributions made to The Vitiligo Society
        to help support our cause. Consider becoming a member to get the latest
        Vitiligo news straight to your inbox, access premium content, early
        bird registration to conferences and events, and special discounts with our
        great partners.</p>
      </div>
    </div>`);
    const amount = parseStdCiviField('.other_amount-section');
    $amount.append('<h3 class="vt-heading" >Your donation</h3>',
      amount.label.text('I would like to give'),
      $('<div class="vt-donation-amount-input-wrapper"/>').append(amount.input)
      );
    $container.append($amount, $blurb);
    $niceForm.append($container);
  }
  function membershipAmountButtons() {
    var a, b;
    var $priceset = $('#priceset').hide();
    const $container = $('<div class="vt-container vt-amount-buttons"></div>');
    var $selectedOption;
    function showButtonAsSelected($btn) {
      $btn.addClass('selected').parent().siblings().find('button').removeClass('selected');
    }
    $priceset.find('input[data-amount]').each(function() {
      var amount = this.dataset.amount;
      const $original_input=$(this);
      // Reformat amount.
      var m = amount.match(/(\d+)(?:(\.\d\d)0*)?$/);
      if (!m) return;

      // @todo remove this, it's just while we apparently need to keep the £26 option
      // but not display it.
      if (m[1] === '26') return;

      if (m[2] === '.00') m[2] = '';

      const $btn = $('<button/>')
        .text(m[1]+m[2])
        .on('click', function(e) {
          e.preventDefault();
          $original_input.click();
          showButtonAsSelected($btn);
        });
      // Save a reference to the button on the input.
      $original_input[0].vitButton = $btn;

      $container.append(
        $('<div class="vt-amount-buttons__button"></div>')
        .append($btn)
      );
      if ($original_input.is(':checked')) {
        $selectedOption= $btn;
      }
    });
    if (!$selectedOption) {
      // Pre-select the 2nd option if no option selected.
      $selectedOption = $priceset.find('input[data-amount]')[1].vitButton;
    }
    // Initial show selected button.
    showButtonAsSelected($selectedOption);

    $niceForm.append('<h3 class="vt-heading vt-heading--smaller-grey1">My contribution</h3>');
    $niceForm.append($container);
    $niceForm.append('<hr/>');
  }
  function whyJoining() {
    var a, b;
    a = parseStdCiviField('#editrow-custom_17');
    a.label.html("<h3 class='vt-heading'>Why are you signing up to membership with the Vitiligo Society?</h3>");
    $niceForm.append($('<div class="vt-container"/>').append(a.label, a.input), '<hr/>');
  }
  const $payment_processor_selection_ui = $form.find("fieldset.payment_options-group");
  var $payment_processor_switch_wrapper; // set in paymentDetails()
  function paymentDetails() {
    $payment_processor_selection_ui.hide();

    const $paymentDetails = $('<div class="vt-payment-box"/>');
    const $header = $(`<div class="vt-payment-box__header">
      <div class="vt-payment-box__gbp"><i class="vt-icon vt-icon--gbp-circle"></i></div>
      <h3 class="vt-payment-box__heading">Your payment details</h3>
      <div class="vt-payment-box__payby">Pay by:</div>
      <div class="vt-payment-box__switch-container">
        <div class="vt-payment-box__switch-wrapper">
          <label class="vt-payment-box__dd" for="CIVICRM_QFID_11_payment_processor_id">Direct Debit</label>
          <label class="vt-payment-box__c" for="CIVICRM_QFID_9_payment_processor_id">Card</label>
        </div>
      </div>
      `);
    const $content = $('<div class="vt-payment-box__content"/>');
    $payment_processor_switch_wrapper = $header.find('.vt-payment-box__switch-wrapper');
    $paymentDetails.append($header, $content);
    $content.append($form.find('#billing-payment-block'));
    $payment_processor_selection_ui.find('input').on('click', selectPaymentMethod);
    $payment_processor_switch_wrapper.find('label').on('click', selectPaymentMethod);
    $niceForm.append($paymentDetails);
    alterPaymentMethodsAvailable();
    selectPaymentMethod();
  }
  function selectPaymentMethod() {
    const selected_processor_id = $payment_processor_selection_ui.find('input:checked').val();

    // Card selected if we dno't have a choice. (Donate page)
    if (typeof(selected_processor_id) === 'undefined') {
      $payment_processor_switch_wrapper.addClass('selected-c').removeClass('selected-dd');
      return;
    }

    if (payment_processor_ids.GoCardless.indexOf(selected_processor_id) > -1) {
      $payment_processor_switch_wrapper.addClass('selected-dd').removeClass('selected-c');
    }
    else {
      $payment_processor_switch_wrapper.addClass('selected-c').removeClass('selected-dd');
    }
  }
  function giftAid() {
    //editrow-custom_10
    const $gaRow = $('#editrow-custom_10');
    const $inputs = $gaRow.find('input');
    const $yes = $inputs.eq(0);
    const $yes_label = $yes.next();
    const $no = $inputs.eq(1);
    const $no_label = $no.next();
    const $helpRow = $('#helprow-custom_10>div');
    const $intro = $helpRow.find('>p').slice(3,5);
    const $declaration = $helpRow.find('p').eq(0).add($helpRow.find('ol').eq(0));

    // Remove the remaining help text.
    $helpRow.remove();

    // Remove the third input ("Yes, in the past 4 years")
    $inputs.eq(2).parent().parent().remove();

    // Now re-assemble.
    const $container = $('<div class="vt-container"></div>');
    $container.append('<h3 class="vt-heading">Gift Aid</h3>', $intro);
    // Now the grid layout
    const $layout = $('<div class="vt-giftaid-layout-1"/>');
    const $inputs_container = $('<div class="vt-giftaid-inputs" />');
    $inputs_container.append($yes, $yes_label, $no, $no_label);
    $layout.append($inputs_container, $('<div class="vt-giftaid-declaration"/>').append($declaration));
    $container.append($layout);
    $niceForm.append($container, '<hr/>');

  }
  function gdprFields() {
    const $gdpr = $('#gdpr-terms-conditions');
    const $niceGdpr = $('<div class="vt-gdpr"></div>');
    $niceGdpr.append($('<div class="vt-gdpr__text"/>').append('<h2>Terms and conditions</h2>', $gdpr.find('.terms-conditions-acceptance-intro')));

    $niceGdpr.append($gdpr.find('.terms-conditions-item'));

    $niceForm.append($niceGdpr);
    $gdpr.remove();
  }
  function donateOtherComments() {
    const c = parseStdCiviField('#editrow-custom_17');
    $niceForm.append(
      $('<div class="vt-container vt-donate-other-comment"/>')
      .append(
        c.label.text('Any other comments?'),
        c.input.attr('placeholder', 'Type here...'))
    );
  }
  function renameSubmitButton(text) {
    // Hide the original button, make a new button which clicks it by JS.
    const $submitButtonWrapper = $form.find('#crm-submit-buttons input').parent().hide();

    const $niceSubmitButton = $('<button class="vt-submit"/>')
      .text(text)
      .on('click', e => {e.preventDefault();$submitButtonWrapper.find('input[type="submit"]').trigger('click');});

    $niceForm.append($niceSubmitButton);
  }
  /**
   * We need to look out for changes that are interactively made by CiviCRM.
   */
  // CiviCRM ends up creating nested versions of this :-(
  // So make a reference to the original.
  const $original_billing_payment_block = $('#billing-payment-block');
  function watchPaymentFields() {
    const wrapper = $original_billing_payment_block[0];
    const config = { childList: true, subtree: true };
    var delayed = false;

    // This function deals with re-presenting card payment fields in the billing-payment-block
    const vitiligoTweakDynamicPaymentFields = function() {
      observer.disconnect();
      reconfigurePaymentBlock();
      $original_billing_payment_block.fadeIn('fast');
      observer.observe(wrapper, config);
    };

    // This callback is used in the mutation observer.
    // Its job is to identify if a DOM mutation is relevant to the billing payment block.
    // If so it will call vitiligoTweakDynamicPaymentFields after half a second.
    const callback = function(mutationsList, observer) {
      var needToTweakUi = false;
      for(var mutation of mutationsList) {
				// We need to detect whether the change was the payment block.
				if (mutation.target.id == 'billing-payment-block') {
          needToTweakUi = true;
				}
      }

      if (needToTweakUi) {
        // Note CiviCRM ends up creating nested #billing-payment-block elements :-(

        // Hide the element while we build this and mess it around.
        $original_billing_payment_block.hide();

        // If already queued, requeue with new delay.
        if (delayed) {
          window.clearTimeout(delayed);
          delayed = false;
        }
        // Allow some time for things to settle.
        delayed = window.setTimeout(vitiligoTweakDynamicPaymentFields, 500);
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(wrapper, config);
  }
  function reconfigurePaymentBlock() {
    // Reconfigure payment block.
    // Remove the non-unique id from the billing-payment-block.
    $original_billing_payment_block.find('#billing-payment-block').attr('id', 'nested-billing-payment-block');
    const $billingBlock = $original_billing_payment_block;
    if ($billingBlock[0].vtTweaksDone) {
      //console.log("Already tweaked it.");
    }
    $billingBlock[0].vtTweaksDone = true;
    // We'll use this existing container for the address fields.
    const $billingAddressSection = $billingBlock.find('.billing_name_address-section');

    $billingBlock.find('.credit_card_number-section').after(
      $('<div class="direct-debit-benefits-para"><div class="dashed" ><i class="vt-icon vt-icon--info"></i>If you have a UK bank account please consider using Direct Debit, we are charged a lesser fee and more of your money goes to supporting those with Vitiligo.</div><i class="vt-icon vt-icon--padlock"></i></div>')
    );
    // Strip out some CiviCRM classes that give us grief.
    $billingBlock.find('.crm-section').removeClass('crm-section');
    $billingBlock.find('div.label').removeClass('label').addClass('vt-payment-label');
    $billingBlock.find('div.content').removeClass('content').addClass('vt-container');
    $billingBlock.find('.clear').remove();


    // Re-class the selects.
    $billingBlock.find('#credit_card_exp_date_M, #credit_card_exp_date_Y')
      .addClass('vt-select')
      .wrap('<div class="vt-select-container vt-card-expiry"/>');

    // If we have a billingAddressSection we need to theme that now.
    if ($billingAddressSection.length) {
      // ... add a title and move the 'same as above' checkbox.
      $billingAddressSection.append('<h2>Your billing information</h2>',
        $billingBlock.find('#billingcheckbox'),
        $billingBlock.find('label[for="billingcheckbox"]')
      );
      // Theme the "My billing address is same..."
      themeRadiosAndCheckboxes($billingAddressSection);

      // Move the Name fields.
      $billingAddressSection.append(buildStdContainer(
        $billingBlock.find('.billing_first_name-section label').text('Name on card'),
        [
          $billingBlock.find('.billing_first_name-section input'),
          $billingBlock.find('.billing_last_name-section input'),
        ]
      ));

      // Move Street addres.,
      $billingAddressSection.append(buildStdContainer(
        $billingBlock.find('.billing_street_address-5-section label').text('Address'),
        [$billingBlock.find('.billing_street_address-5-section input').attr('placeholder', 'Address line 1*')]
      ));

      // Move City., county.
      $billingAddressSection.append(buildStdContainer(
        null,
        [
          $billingBlock.find('.billing_city-5-section input').attr('placeholder', 'Town/City'),
          killSelect2($billingBlock.find('.billing_state_province_id-5-section select'))
        ]
      ));

      // Move Post code, country.
      $billingAddressSection.append(buildStdContainer(
        null,
        [
          $billingBlock.find('.billing_postal_code-5-section input').attr('placeholder', 'Postcode'),
          killSelect2($billingBlock.find('.billing_country_id-5-section select'))
        ]
      ));

      // Hide left over crud.
      $billingBlock.find([
        '.billing_first_name-section',
        '.billing_middle_name-section',
        '.billing_last_name-section',
        '.billing_street_address-5-section',
        '.billing_city-5-section',
        '.billing_state_province_id-5-section',
        '.billing_postal_code-5-section',
        '.billing_country_id-5-section',
      ].join(',')).hide();
    }

  }
  function themeRadiosAndCheckboxes($context) {
    $context.find('input[type="radio"], input[type="checkbox"]').each(function() {
      const $input = $(this);
      if ($input.is('.vt-themed')) {
        return;
      }
      const $label = $input.next();
      const $wrapper = $('<div class="vt-checkbox-radio-wrapper"/>');
      if ($input.is('input[type="checkbox"]')) {
        $wrapper.addClass('checkbox');
      }
      else {
        $wrapper.addClass('radio');
      }
      $input.before($wrapper);
      $wrapper.append($input, $label);
      $input.addClass('vt-themed');
    });
  }
  function donateMovePaymentBlock() {
    reconfigurePaymentBlock();
  }
  // Returns DOM node.
  function findPaymentProcessorRadioForProcessorType(processorType) {
    var processorIds = payment_processor_ids[processorType] || [];

    var found;
    $('fieldset.payment_options-group [name="payment_processor_id"]').each(function() {
      var m =this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
      if (m && m.length === 2 && processorIds.indexOf(m[1])>-1) {
        found = this;
      }
    });

    return found;
  }
  function alterPaymentMethodsAvailable() {

    var allow_dd = false;

    const selected_processor_id = $form.find('fieldset.payment_options-group input:checked').val();
    if (form_name === 'membership') {
      // Membership. Allow DD if in uk.
      allow_dd = 'United Kingdom' === $('#country-Primary option:selected').text();
    }

    const vt_payment = $('.vt-payment-box');
    const ddProcessor = $(findPaymentProcessorRadioForProcessorType('GoCardless'));

    if (allow_dd) {
      // Allow DD and Card.
      vt_payment.removeClass('disable-dd');
    }
    else {
      // Disable DD payments.
      vt_payment.addClass('disable-dd');
      // If currently selected processor is DD then do the change now.
      if (ddProcessor.is(':checked')) {
        // Need to change it.
        $(findPaymentProcessorRadioForProcessorType('Stripe')).click();
        selectPaymentMethod();
      }
    }
    // Now disable DD radio input unless in uk.
    // This is done for accessibility reasons - visual users will already not
    // have a way to select those.
    $(ddProcessor).prop('disabled', !allow_dd);
  }

  if (form_name === 'membership') {

    $niceForm.addClass('vt-membership-form');
    membershipAmountButtons();
    yourInformation();
    whyJoining();
    paymentDetails();
    giftAid();
    gdprFields();
    renameSubmitButton('Join');
    themeRadiosAndCheckboxes($('body'));
    watchPaymentFields();
    // Remove left over elements.
    $('fieldset.crm-profile-name-name_and_address').remove();
  }
  else if (form_name === 'donate') {

    $niceForm.addClass('vt-donate-form');
    donateAmountLayout();
    yourInformation();
    giftAid();
    donateOtherComments();
    paymentDetails();
    donateMovePaymentBlock();
    gdprFields();
    renameSubmitButton('Donate');
    themeRadiosAndCheckboxes($('body'));
    // Remove left over elements.
    $('fieldset.crm-profile-name-name_and_address, fieldset.crm-profile-name-supporter_profile').remove();

  }
}))(CRM, CRM.$);

