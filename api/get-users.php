<?php
include_once('inc_check-login.php');

$sUsers = file_get_contents('../data/users.txt');
$aUsers = json_decode($sUsers);



/* 
for ($i = 0; $i < count($aUsers); $i++) {
  //$user = $aUsers[i];
  unset( $aUsers->$i['password'] );
}
 */
print_r(unset( $aUsers[0]['password'] );
// echo $sUsers;
?>