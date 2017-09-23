<?php
// Checks if user is logged in. Can be used in api's to make sure that request
// only happens for logged in users.
/*
Doesn't really work. Make it work..
*/

if ( !isset($_SESSION['sUser']) ) {
  // User is not logged in. Stop script
  // No need to waste server-resources for request by
  // none-users
  /* exit; */
}
?>