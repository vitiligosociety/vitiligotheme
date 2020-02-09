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
  blockUI();
  vtDebug("found form ", $form);

  const $niceForm = $('<div/>');
  $form.append($niceForm);
  vtDebug("new form", $niceForm);

  // Set defaults for jQuery validate
  setDefaultsForJQueryValidate();

  function setDefaultsForJQueryValidate() {
    var validator = $form.validate();
    validator.settings.ignore = ".novalidate .select2-offscreen, [readonly], :hidden:not(.crm-select2)";
  }

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

  function footerText() {
    if (! $('#footer_text').text().match(/^\s*$/)) {
      $niceForm.append(
        $(`<div class="vt-footer vt-remove-empty-paras dashed vt-allow-left-icon"><i class="vt-icon vt-icon--info" ></i></div>`).append($('#footer_text'))
      );
    }
  }

  function yourInformation() {
    var a, b;
    $niceForm.append('<div class="vt-your-info"><h2>Your information</h2><span>*Required fields</span></div>');

    // Add name fields.
    var first_name = parseStdCiviField('#editrow-first_name');
    first_name.label.html('Full name<span class="crm-marker" title="This field is required.">*</span>');
    first_name.input.attr('placeholder', 'First name');
    var last_name = parseStdCiviField('#editrow-last_name');
    last_name.input.attr('placeholder', 'Last name');
    createStdFields(first_name.label, [first_name.input, last_name.input]);

    // Add email
    var email = parseStdCiviField('#editrow-email-1, #editrow-email-Primary');
    email.label.html('Email address<span class="crm-marker" title="This field is required.">*</span>');
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
    a.label.html('Your address<span class="crm-marker" title="This field is required.">*</span>');
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
    a.label.text('Date of birth');
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
    const $origInputAmount = $(amount.input);
    const $vitAmount = $('<input type="text" />')
      .on('blur keyup', (e) => {
        // Copy the value to the original CiviCRM
        $origInputAmount.val($vitAmount.val());
        $origInputAmount.trigger('keyup', e);
      });
    $amount.append('<h3 class="vt-heading" >Your donation</h3>',
      amount.label.text('I would like to give'),
      $('<div class="vt-donation-amount-input-wrapper"/>').append($vitAmount)
    );
    $container.append($amount, $blurb);
    $niceForm.append($container);
  }

  function addPropositionTripple() {
    $niceForm.append(`<div class="vt-propositions-tripple">
      <h2>Your money supports:</h2>
      <ul class="vt-propositions-tripple__items">
        <li class="vt-propositions-tripple__item">
          <i class="vt-icon vt-icon--medical"></i>
          <strong>Engagement</strong> with the medical profession
        </li>
        <li class="vt-propositions-tripple__item">
          <i class="vt-icon vt-icon--magnify"></i>
          <strong>Research</strong> into the causes and treatments for vitiligo
        </li>
        <li class="vt-propositions-tripple__item">
          <i class="vt-icon vt-icon--speaker"></i>
          <strong>Awareness</strong> increasing vitiligo awareness
        </li>
      </ul>
      </div>`);
  }

  function membershipIntro() {
    const $civicrm_content = $form.find('#membership #priceset fieldset');
    // Replace the header provided by WP.
    $('section.page-header h1').text($civicrm_content.find('>legend').text());
    $niceForm.append(
      $('<div class="vt-proposition-box"/>')
        .append(
          $('<div class="vt-proposition-box__body"/>').append($civicrm_content.find('#membership-intro'))
        )
    );
  }

  function membershipAmountButtons() {
    var a, b;
    var $priceset = $('#priceset').hide();
    const $container = $('<div class="vt-container vt-amount-buttons"></div>');
    const $equiv = $('<p class="vt-membership-amount-equiv"></p>');
    var $selectedOption;

    function showButtonAsSelected($btn) {
      $btn.addClass('selected').parent().siblings().find('button').removeClass('selected');
      var equivAmount = Math.round(parseFloat($btn.data('amount'))/12*100)/100;
      $equiv.html(`Your annual contribution is equal to giving <strong>£${equivAmount}</strong> per month`);
    }

    function check1(e) {
      if (CRM.$('[name="payment_processor_id"]:checked').val() === undefined) {
        console.warn("payment_processor_id missing: " + e);
      }
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
        .data('amount', m[1]+m[2])
        .text('£' + m[1]+m[2])
        .on('click', function(e) {
          e.preventDefault();
          // 2019-08-29 The following line seems necessary to ensure the value is properly set.
          $original_input.prop('checked', true);
          // We click the input to try to keep as much default CiviCRM behaviour as poss,
          // however we could consider not doing this as it has caused problems in that it
          // does not seem to always correctly set the radio on.
          $original_input.click();
          // CiviCRM shows this, so we need to hide it!
          $payment_processor_selection_ui.hide();
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

    $niceForm.append('<h2 class="vt-heading vt-heading--blue">Your annual contribution</h2>');
    $niceForm.append($container);
    $niceForm.append($equiv);
    $niceForm.append('<hr/>');

    // Initial show selected button.
    showButtonAsSelected($selectedOption);
  }

  function whyJoining() {
    var a, b;
    a = parseStdCiviField('#editrow-custom_17');
    a.label.html("<h3 class='vt-heading'>Why are you signing up to membership with The Vitiligo Society?</h3>");
    $niceForm.append($('<div class="vt-container"/>').append(a.label, a.input), '<hr/>');
  }

  function donateIntro() {
    const $civicrm_content = $form.find('#intro_text');
    // Replace the header provided by WP.
    // membership only: $('section.page-header h1').text($civicrm_content.find('>legend').text());
    $niceForm.append(
      $('<div class="vt-proposition-box"/>')
        .append(
          $('<div class="vt-proposition-box__body"/>').append($civicrm_content)
        )
    );
  }

  const $payment_processor_selection_ui = $form.find("fieldset.payment_options-group");
  vtDebug('payment processor selection ui', $payment_processor_selection_ui);
  var $payment_processor_switch_wrapper; // set in paymentDetails()

  /*
   * Do payment details.
   */
  function paymentDetails() {
    $payment_processor_selection_ui.hide();
    const gcRadio = findPaymentProcessorRadioForProcessorType('GoCardless');
    const stripeRadio = findPaymentProcessorRadioForProcessorType('Stripe');

    const $paymentDetails = $('<div class="vt-payment-box"/>');
    const $header = $(`<div class="vt-payment-box__header">
      <div class="vt-payment-box__gbp"><i class="vt-icon vt-icon--gbp-circle"></i></div>
      <h3 class="vt-payment-box__heading">Your payment details</h3>
      <div class="vt-payment-box__payby">Pay by:</div>
      <div class="vt-payment-box__switch-container">
        <div class="vt-payment-box__switch-wrapper">
          <label class="vt-payment-box__dd" >Direct Debit</label>
          <label class="vt-payment-box__c"  >Card</label>
        </div>
      </div>
      `);
    // link the new labels with the old inputs.
    $header.find('label.vt-payment-box__dd')
      .attr('for', gcRadio ? gcRadio.id : null);
    $header.find('label.vt-payment-box__c')
      .attr('for', stripeRadio ? stripeRadio.id : null);

    const $content = $('<div class="vt-payment-box__content"/>');
    $content.append(`
      <div class="vt-payment-dd-message">
        <div class="vt-payment-dd-message__inner dashed"><i class="vt-icon vt-icon--info"></i>You will be asked to securely enter your bank details on the next page to initiate the Direct Debit mandate.</div>
        <i class="vt-icon vt-icon--padlock"></i>
      </div>`);
    $payment_processor_switch_wrapper = $header.find('.vt-payment-box__switch-wrapper');
    $paymentDetails.append($header, $content);
    $content.append($form.find('#billing-payment-block'));
    $payment_processor_selection_ui.find('input').on('click', selectPaymentMethod);
    $payment_processor_switch_wrapper.find('label').on('click', selectPaymentMethod);
    $niceForm.append($paymentDetails);
    alterPaymentMethodsAvailable();
    selectPaymentMethod();
    unblockUI();
  }

  function selectPaymentMethod() {
    blockUI();
    const selected_processor_id = $payment_processor_selection_ui.find('input:checked').val();

    // Card selected if we don't have a choice. (Donate page)
    if (typeof(selected_processor_id) === 'undefined') {
      $payment_processor_switch_wrapper.addClass('selected-c').removeClass('selected-dd')
        .closest('.vt-payment-box').addClass('selected-c').removeClass('selected-dd');
      return;
    }

    if (payment_processor_ids.GoCardless.indexOf(selected_processor_id) > -1) {
      $payment_processor_switch_wrapper.addClass('selected-dd').removeClass('selected-c')
        .closest('.vt-payment-box').addClass('selected-dd').removeClass('selected-c');
    }
    else {
      $payment_processor_switch_wrapper.addClass('selected-c').removeClass('selected-dd')
        .closest('.vt-payment-box').addClass('selected-c').removeClass('selected-dd');
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
    $inputs_container.append('<div class="vt-giftaid-declaration--label vt-label"><label>Can we reclaim gift aid on your donation?</label></div>', $yes, $yes_label, $no, $no_label);
    $layout.append($inputs_container, $('<div class="vt-giftaid-declaration"/>').append('<i class="vt-icon vt-icon--info"></i>', $declaration));
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
    $('div.recaptcha-section').appendTo('.vt-gdpr');
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
    var formHasBeenSubmitted = false;

    const $niceSubmitButton = $('<button class="vt-submit"/>')
      .text(text)
      // Save the original button text to the button for later restore
      .data('text', text)
      .on('click', e => {
        e.preventDefault();
        $form.data('crmBillingFormValid', true);
        if (!$('input#accept_tc:checked').length || !$('input#accept_entity_tc:checked').length) {
          $form.data('crmBillingFormValid', false);
        }
        // Disable the button.
        $niceSubmitButton.prop('disabled', true).text('Please wait...');
        $submitButtonWrapper.find('input[type="submit"]').trigger('click', e);
      });

    $niceForm.append($niceSubmitButton);

    $form.on('submit', e => {
      formHasBeenSubmitted = true;
      vtDebug('Form submitted.');
      $niceSubmitButton.prop('disabled', true).text('Please wait...');
      if (!$form.valid()) {
        e.preventDefault();
        $form.trigger('crmBillingFormNotValid');
      }
    });

    $form.on('crmBillingFormNotValid', e => {
      vtDebug("resetting submit button as form not submitted");
      $niceSubmitButton.prop('disabled', false).text($niceSubmitButton.data('text'));

      // Work around issues with jQuery validate hiding labels/clearing text once stripe has been selected
      $('body').find('input[type=checkbox]:not(:checked)').each(function() {
        const $input = $(this);
        const elementName = $(this).attr('id');
        $('label[for=' + elementName + ']').addClass('pseudo-error');
        if (typeof $('label[for=' + elementName + ']').data('text') !== 'undefined') {
          $('label[for=' + elementName + ']').text($('label[for=' + elementName + ']').data('text'));
          $('label[for=' + elementName + ']').prepend('<span class="checkbox-radio"></span>');
        }
        $('label#' + elementName + '-error').remove();
      });
      notifyUser('error', '', ts('Please check and fill in all required fields!'), '.vt-your-info');
    });
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

    $form.on('crmBillingFormReloadComplete', e => {
      vtDebug('crmBillingFormReloadComplete');
      vitiligoTweakDynamicPaymentFields();
    });

    // This function deals with re-presenting card payment fields in the billing-payment-block
    const vitiligoTweakDynamicPaymentFields = function() {
      vtDebug('tweak dynamic payment fields');
      reconfigurePaymentBlock();
      $original_billing_payment_block.fadeIn('fast');
      unblockUI();
    };

  }

  function reconfigurePaymentBlock() {
    // Reconfigure payment block.
    blockUI();
    // Remove the non-unique id from the billing-payment-block.
    $original_billing_payment_block.find('#billing-payment-block').attr('id', 'nested-billing-payment-block');

    const $billingBlock = $original_billing_payment_block;
    if ($billingBlock[0].vtTweaksDone) {
      //vtDebug("Already tweaked it.");
    }
    $billingBlock[0].vtTweaksDone = true;

    // We'll use this existing container for the address fields.
    const $billingAddressSection = $billingBlock.find('.billing_name_address-section');

    // Wrap the #card-element that holds the new Stripe elements
    const $cardElement = $billingBlock.find('#card-element')
      .wrap('<div class="vt-card-element"/>');

    // Add Para on DD is better.
    if ($('div.direct-debit-benefits-para').length === 0) {
      $cardElement.after(
        $('<div class="direct-debit-benefits-para"><div class="dashed" ><i class="vt-icon vt-icon--info"></i>Are you using a UK bank account? Please consider using Direct Debit. We are charged a lesser fee and more of your money goes to supporting those with vitiligo!</div><i class="vt-icon vt-icon--padlock"></i></div>')
      );
    }
    vtDebug('cardElement',$cardElement);

    // Strip out some CiviCRM classes that give us grief.
    // We can't remove this, Stripe depends on it: $billingBlock.find('.crm-section').removeClass('crm-section');
    $billingBlock.find('div.label').removeClass('label').addClass('vt-payment-label');
    $billingBlock.find('div.content').removeClass('content').addClass('vt-container');
    $billingBlock.find('.clear').remove();

    // If we have a billingAddressSection we need to theme that now.
    if ($billingAddressSection.length && ($('#billing-address-title').length === 0)) {
      // ... add a title and move the 'same as above' checkbox.
      $billingAddressSection.append('<h2 id="billing-address-title">Your billing information</h2>',
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
    $context.find('input[type="radio"]:not([name="payment_processor_id"]), input[type="checkbox"]').each(function() {
      const $input = $(this);
      if ($input.is('.vt-themed')) {
        return;
      }
      const $label = $("label[for='" + $(this).attr('id') + "']");
      $label.prepend('<span class="checkbox-radio"></span>');
      $label.data('text', $label.text());
      const $wrapper = $('<div class="vt-checkbox-radio-wrapper"/>');
      if ($input.is('input[type="checkbox"]')) {
        $wrapper.addClass('checkbox');
      }
      else {
        $wrapper.addClass('radio');
      }
      $input.before($wrapper);
      var $required = '';
      if ($input.hasClass('required')) {
        $required = '<span class="crm-marker"> * </span>';
      }
      $wrapper.append($input, $label, $required);
      $input.addClass('vt-themed novalidate');
      $input.removeClass('valid required error');
      $input.removeAttr('aria-required');
    });

    // "Pseudo" validate checkboxes (as they're hidden and replaced with labels, which breaks a bit with jquery validate)
    const inputETC = $('input#accept_entity_tc');
    inputETC.on('change', function() {
      setAcceptCheckboxesValid(inputETC, 'accept_entity_tc');
    });

    const inputTC = $('input#accept_tc');
    inputTC.on('change', function() {
      setAcceptCheckboxesValid(inputTC, 'accept_tc');
    });

    function setAcceptCheckboxesValid(element, elementName) {
      $('label[for=' + elementName + ']').removeClass('error alert-danger pseudo-error');
      if (!element.prop('checked')) {
        $('label[for=' + elementName + ']').addClass('pseudo-error');
      }
    }
  }

  function donateMovePaymentBlock() {
    reconfigurePaymentBlock();
    $original_billing_payment_block.show();
    vtDebug($original_billing_payment_block);
    unblockUI();
  }

  // Returns DOM node.
  function findPaymentProcessorRadioForProcessorType(processorType) {
    var processorIds = payment_processor_ids[processorType] || [];
    vtDebug("Looking for processor type", processorType, " matching ids:", processorIds);

    var found;
    $('fieldset.payment_options-group [name="payment_processor_id"]').each(function() {
      var m =this.id.match(/CIVICRM_QFID_(\d+)_payment_processor_id$/);
      if (m && m.length === 2 && processorIds.indexOf(m[1])>-1) {
        vtDebug("Found match", this);
        found = this;
      }
    });
    vtDebug("processor find result", found);

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
    membershipIntro();
    addPropositionTripple();
    membershipAmountButtons();
    yourInformation();
    whyJoining();
    paymentDetails();
    giftAid();
    gdprFields();
    renameSubmitButton('Join');
    footerText();
    themeRadiosAndCheckboxes($('body'));
    watchPaymentFields();
    $('#crm-submit-buttons').hide();
    // Remove left over elements.
    $('fieldset.crm-profile-name-name_and_address').remove();
  }
  else if (form_name === 'donate') {
    $niceForm.addClass('vt-donate-form');
    donateIntro();
    donateAmountLayout();
    addPropositionTripple();
    yourInformation();
    giftAid();
    donateOtherComments();
    paymentDetails();
    donateMovePaymentBlock();
    gdprFields();
    renameSubmitButton('Donate');
    footerText();

    themeRadiosAndCheckboxes($('body'));
    $('#crm-submit-buttons').hide();
    // Remove left over elements.
    $('fieldset.crm-profile-name-name_and_address, fieldset.crm-profile-name-supporter_profile').remove();

    unblockUI();
  }

  function blockUI() {
    vtDebug('blocking UI');
    CRM.$.blockUI({
      message: '<div class="fa-3x"><i class="fa fa-spinner fa-spin"></i></div>',
      css: {
        backgroundColor: 'transparent',
        border: 'none'
      },
    });
  }

  function unblockUI() {
    vtDebug('unblocking UI');
    $.unblockUI();
  }

  /**
   * Output debug information
   * @param {string} message
   * @param {object} object
   */
  function vtDebug(message, object) {
    // Uncomment the following to debug unexpected returns.
    console.log(new Date().toISOString() + ' vtDebug: ' + message, object);
  }

  /**
   * If we have the sweetalert2 library popup a nice message to the user.
   *   Otherwise do nothing
   * @param {string} icon
   * @param {string} title
   * @param {string} text
   * @param {string} scrollToElement
   */
  function notifyUser(icon, title, text, scrollToElement) {
    if ($('div#card-element').length !== 0) {
      vtDebug('notify defer to stripe');
      return;
    }
    if (typeof Swal === 'function') {
      var swalParams = {
        icon: icon,
        text: text
      };
      if (title) {
        swalParams.title = title;
      }
      if (scrollToElement) {
        swalParams.onAfterClose = function() { window.scrollTo($(scrollToElement).position()); };
      }
      Swal.fire(swalParams);
    }
  }

}))(CRM, CRM.$);

