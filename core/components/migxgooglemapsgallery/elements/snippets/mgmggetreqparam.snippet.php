<?php
$name = $modx->getOption('name',$scriptProperties,'');
return $modx->getOption($name,$_REQUEST,'');