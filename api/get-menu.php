<?php 
session_start();
$sUser = $_SESSION['sUser'];
$jResponse = json_decode("{}");
if ( isset($sUser) ) {
  $jUser = json_decode($sUser);

  $sManageUsers = '';
  if ($jUser->role == "admin") {
    $sManageUsers = '<a class="page-link" data-go-to-page="manage-users">Manage users</a>';
  }

  $jResponse->markup = '
  <a class="page-link" data-go-to-page="view-products">Products</a>
  <a class="page-link" data-go-to-page="add-product">Add products</a>
  '.$sManageUsers.'
  <div class="seperator"></div>
  <div class="dropdown">
    <div class="title">
      <div class="profile-picture" style="background-image: url(images/profile-pictures/'.$jUser->profilePicture.')">
      </div>
      <p>'.$jUser->firstName.' '.$jUser->lastName.'</p>
      <i class="material-icons">more_vert</i>
    </div>
    <div class="content">
      <a class="page-link" data-go-to-page="edit-user">Edit profile</a>
      <a class="page-link" data-go-to-page="edit-user">My products</a>
      <div class="seperator"></div>
      <a id="btnSignOut">Sign out</a>
    </div>
  </div>';
} else {
  $jResponse->markup = '<a class="page-link" data-go-to-page="add-user">Sign up</a><a class="page-link" data-go-to-page="login">Log in</a>';
}
  
$sResponse = json_encode($jResponse);
echo $sResponse;
exit;
?>