<?php
session_start();
if (isset($_SESSION['sUser'])) {
  $sProducts = file_get_contents('../data/products.txt');
  //$aProducts = json_decode($sProducts);
  echo $sProducts; 
} else {
  echo '{"message": "You need to be logged in to access this data"}';
}
?>