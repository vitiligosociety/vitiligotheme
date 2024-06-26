<?php
if (!defined('VITILIGO_MEMBERSHIP_FORM_ID')) {
  define('VITILIGO_MEMBERSHIP_FORM_ID', '1');
}
if (!defined('VITILIGO_DONATION_FORM_ID')) {
  define('VITILIGO_DONATION_FORM_ID', '2');
}
if (!defined('VITILIGO_MEMBERSHIP_RENEWAL_FORM_ID')) {
  define('VITILIGO_MEMBERSHIP_RENEWAL_FORM_ID', '6');
}

require_once 'vitiligotheme.civix.php';
use CRM_Vitiligotheme_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_config
 */
function vitiligotheme_civicrm_config(&$config) {
  _vitiligotheme_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_install
 */
function vitiligotheme_civicrm_install() {
  _vitiligotheme_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_enable
 */
function vitiligotheme_civicrm_enable() {
  _vitiligotheme_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_buildForm in order to inject custom js for membership forms.
 *
 * @see https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_buildForm/
 */
function vitiligotheme_civicrm_buildForm($formName, &$form) {

  if ($formName !== 'CRM_Contribute_Form_Contribution_Main') {
    return;
  }

  $js = $css = '';
  if (in_array($form->_id, [VITILIGO_MEMBERSHIP_FORM_ID, VITILIGO_MEMBERSHIP_RENEWAL_FORM_ID])) {
    // We need to lookup Stripe and GoCardless payment processors' IDs.

    // Lookup Stripe and GoCardless payment procesor types; create an array like <ID> => 'type'
    $types = civicrm_api3('PaymentProcessorType', 'get', [
      'sequential' => 1,
      'return' => ["id", "name"],
      'name' => ['IN' => ["Stripe", "GoCardless"]],
    ]);
    $type_ids = [];
    foreach ($types['values'] as $_) {
      $type_ids[$_['id']] = $_['name'];
    }

    // Find payment processors.
    $processors = civicrm_api3('PaymentProcessor', 'get', [
      'payment_processor_type_id' => ['IN' => array_keys($type_ids)],
      'return' => ['id', 'payment_processor_type_id'],
      'options' => ['limit' => 0]]);
    $config = ['GoCardless' => [], 'Stripe' => []];
    foreach ($processors['values'] as $_) {
      $config[$type_ids[$_['payment_processor_type_id']]][] = $_['id'];
    }
    $config = json_encode($config);

    // See https://docs.civicrm.org/dev/en/latest/framework/region/#adding-content-to-a-region
    // Nb. there is a mechanism for adding a script tag that fetches a script by URL.
    // However, that's likely to be slower than just including the file here since it's another
    // round-trip.
    // Also note 'Note: WP support is inconsistent pending refactor.' - from link above.
    $js = file_get_contents(__DIR__ . '/js/membership-formtheme.js');
    $js = strtr($js, [
      'var payment_processor_ids = {}; //%config%' => "var payment_processor_ids = $config;",
      'var form_name = \'\'; //%formname%'          => 'var form_name = "membership";',
    ]);
    //$js .= file_get_contents(__DIR__ . '/js/fix-radio-checkbox-layout.js');
    $css = file_get_contents(__DIR__ . '/css/vitiligotheme.css');
  }
  elseif ($form->_id == VITILIGO_DONATION_FORM_ID) {
    $js = file_get_contents(__DIR__ . '/js/membership-formtheme.js');
    $js = strtr($js, [
      'var form_name = \'\'; //%formname%' => 'var form_name = "donate";',
    ]);
    //$js .= file_get_contents(__DIR__ . '/js/fix-radio-checkbox-layout.js');
    $css = file_get_contents(__DIR__ . '/css/vitiligotheme.css');
  }

  if ($js || $css) {
    if (empty(CRM_Core_Session::getLoggedInContactID())) { return; }
    CRM_Core_Region::instance('page-body')->add(['markup' => "<script>$js</script><style>$css</style>"]);
  }
}
