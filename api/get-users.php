<?php
include_once('inc_check-login.php');

$sUsers = file_get_contents('../data/users.txt');
$aUsers = json_decode($sUsers);

for ($i = 0; $i < count($aUsers); $i++) {
  
}

echo $sUsers;
?>