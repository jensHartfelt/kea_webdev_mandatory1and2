<?php
session_start();

$sProductId = $_GET['productId'];

if (isset($_SESSION['sUser'])) {
  $sProducts = file_get_contents('../data/products.txt');
  $aProducts = json_decode($sProducts);
  for ($i = 0; $i < count($aProducts); $i++) {
    if ($aProducts[$i]->id == $sProductId) {
      $sProduct = json_encode( $aProducts[$i] );
      echo $sProduct;
      exit;
    }
  }
} else {
  echo '{"message": "You need to be logged in to access this data"}';
}
?>