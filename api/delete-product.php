<?php
session_start();

// Kills script if user is not logged in
//include_once('inc_check-login.php');


// Get all products
$sProducts = file_get_contents('../data/products.txt');
$aProducts = json_decode($sProducts);

// Get the id of the current product
$sDeleteProductId = $_POST['txtProductId'];

// Find the matching product and change it
for ($i = 0; $i < count($aProducts); $i++) {
  if ($aProducts[$i]->id == $sDeleteProductId) {
    array_splice($aProducts, $i, 1);
    $sProducts = json_encode($aProducts);
    file_put_contents('../data/products.txt', $sProducts);
    echo '{"message":"success"}';
    exit;
  }
}
?>