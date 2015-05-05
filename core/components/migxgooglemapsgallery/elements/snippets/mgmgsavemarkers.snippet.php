<?php
$resource_id = (int)$modx->getOption('resource_id', $_POST, 0);
$items = $modx->getOption('items', $_POST, 0);
$tvname = $modx->getOption('tvname', $scriptProperties, '');
$permission = $modx->getOption('permission', $scriptProperties, 'edit_document');
$result = array();
$result['success'] = false;
$result['message'] = 'err_save';

if (!empty($permission)) {
    if (!$modx->hasPermission($permission)) {
        $result['message'] = $modx->lexicon('access_denied');
        return $modx->toJson($result);
    }
}

if (!empty($resource_id)) {
    if ($resource = $modx->getObject('modResource', $resource_id)) {
        if ($resource->setTVValue($tvname, $items)) {
            $result['success'] = true;
            $result['message'] = 'success';
        }

        //clear cache for all contexts
        $collection = $modx->getCollection('modContext');
        foreach ($collection as $context) {
            $contexts[] = $context->get('key');
        }
        $modx->cacheManager->refresh(array(
            'db' => array(),
            'auto_publish' => array('contexts' => $contexts),
            'context_settings' => array('contexts' => $contexts),
            'resource' => array('contexts' => $contexts),
            ));

    }
}

return $modx->toJson($result);