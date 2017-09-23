<?php 
session_start();
$sUser = $_SESSION['sUser'];
$jResponse = json_decode("{}");
if ( isset($sUser) ) {
  $jUser = json_decode($sUser);
  $jResponse->markup = '
  <!-- Edit user -->
  <div class="page" data-page-id="edit-user">
    <div class="container small">
      <h2>Edit your profile</h2>
      <div id="txtEditUserMessage" class="message succes">
        <p>Your changes were saved</p>
      </div>

      <h3>Profile preview</h3>
      <div id="displayCurrentUserData">
        <!-- User preview will dynamically be inserted here -->
      </div>

      <h3>Profile Data</h3>
      <form id="frmEditUser" class="u_mb-xl">
        <label for="txtFirstName">New first Name</label>
        <input type="text" name="txtFirstName">
        
        <label for="txtLastName">New last Name</label>
        <input type="text" name="txtLastName">
        
        <label for="txtPhone">New phone number</label>
        <input type="phone" name="txtPhone">
        
        <label for="txtEmail">New email adress</label>
        <input type="email" name="txtEmail">
        
        <label for="fileProfilePicture">New profile picture</label>
        <input type="file" name="fileProfilePicture">
        
        <label for="txtPassword">New password</label>
        <input type="password" name="txtPassword" class="u_mb-xl">
        
        <a id="btnEditUser" class="button positive">Save changes <i class="material-icons">save</i></a>
        <a id="btnDeleteUser" class="button red u_mb-xxl">Delete profile <i class="material-icons">delete</i></a>
      </form>
    </div>
  </div>
  
  <!-- Products -->
  <div class="page" data-page-id="view-products">
    <div class="container big">
      <h2>Products</h2>
      <div id="txtDeleteProductMessage" class="message succes">
        <p>Product deleted</p>
      </div>
      <div class="products-filters u_mb-xl">
        <p id="txtVisibleProductStatus"></p>
        <div class="dropdown">
          <div class="title">
            <p>Order by</p>
            <i class="material-icons">arrow_drop_down</i>
          </div>
          <div class="content">
            <a id="btnSortAscending">Price: Low to high</a>
            <a id="btnSortDecending">Price: High to low</a>
          </div>
        </div>
        <div class="search-input-container">
          <input type="text" placeholder="Search for product" id="inputFilterProducts">
        </div>
      </div>

      <div class="products-container" id="productContainer">
        <!-- Products will be dynamically inserted here -->
      </div>
    </div>
  </div>
  
  <!-- Add product -->
  <div class="page" data-page-id="add-product">
    <div class="container small">
      <h2>Add product</h2>
      <div id="txtAddProductMessage" class="message succes">
        <p>New product added</p>
      </div>
      <form id="frmAddProduct">
        <label for="txtProductName">Name</label>
        <input type="text" name="txtProductName" placeholder="Enter product name here">
        <label for="txtProductPrice">Price</label>
        <input type="number" name="txtProductPrice">
        <label for="fileProductPicture">Picture</label>
        <input type="file" name="fileProductPicture" class="u_mb-xl">

        <a id="btnAddProduct" class="button positive">Add product <i class="material-icons">add</i></a>
        <a class="button invisible">Cancel<i class="material-icons">close</i></a>
      </form>
    </div>
  </div>

  <!-- Edit product -->
  <div class="page" data-page-id="edit-product">
    <div class="container small">
      <h2>Edit product</h2>
      <form id="frmEditProduct">
        <label for="txtProductName">Name</label>
        <input type="text" name="txtProductName">
        <label for="txtProductPrice">Price</label>
        <input type="number" name="txtProductPrice">
        <label for="fileProductPicture">Picture</label>
        <input type="file" name="fileProductPicture" class="u_mb-xl">
        <input type="text" name="txtProductId" class="u_hidden">
        <a id="btnEditProduct" class="button positive">Save changes <i class="material-icons">save</i></a>
        <a id="btnDeleteProduct" class="button red">Delete <i class="material-icons">delete</i></a>
        <a class="button invisible page-link" data-go-to-page="view-products">Cancel<i class="material-icons">close</i></a>
      </form>
    </div>
  </div>';
  if ($jUser->role == "admin") {
    $jResponse->markup .= '
    <div class="page" data-page-id="manage-users">
    <div class="container small">
      <h2>Manage users</h2>
      <div id="txtDeleteUserMessage" class="message succes">
        <p>User was deleted</p>
      </div>
      
      <div id="usersContainer">
        <!-- Users will be inserted here -->
      </div>
    </div>
  </div>';
  }
}
  
$sResponse = json_encode($jResponse);
echo $sResponse;
exit;
?>