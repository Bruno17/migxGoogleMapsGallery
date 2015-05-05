<?php
$scriptTpl = $modx->getOption('scriptTpl', $scriptProperties, '');
$resource_ids = explode(',', $modx->getOption('resource_ids', $scriptProperties, ''));
$tvname = $modx->getOption('tvname', $scriptProperties, 'markers');
$icon_tvname = $modx->getOption('icon_tvname', $scriptProperties, 'marker_icon');
$markergroupOptionTpl = $modx->getOption('markergroupOptionTpl', $scriptProperties, '');

$markergroups = array();

foreach ($resource_ids as $resource_id) {
    if ($resource = $modx->getObject('modResource', $resource_id)) {
        $resource_array = $resource->toArray();
        $group = array();
        $group['resource_id'] = $resource_id;
        $group['markers'] = $modx->fromJson($resource->getTVValue($tvname));
        $group['iconoptions'] = $modx->fromJson($resource->getTVValue($icon_tvname));
        $markergroups[] = $group;
        
        $options[] = $modx->getChunk($markergroupOptionTpl,$resource_array); 
    }
}
$scriptProperties['markergroups'] = $modx->toJson($markergroups);
$modx->setPlaceholder('markergroup_options',implode('',$options));

$output = $modx->getChunk($scriptTpl, $scriptProperties);

return $output;