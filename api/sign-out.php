<?php
  session_start();
  $sUser = $_SESSION['sUser'];
  $jUser = json_decode($sUser);
  echo '{"message": "Signet out '.$jUser->firstName.' '.$jUser->lastName.'"}';
  session_destroy();
?>