/**
 *  "page" could literally be named anything
 *  It's methods are accesible through page.method
 * 
 * 
 */
var page = {
  // Elements
  els: {
    masterContainer: document.querySelector("#masterContainer"),
    pages: document.querySelectorAll(".page"),
    navigation: document.querySelector(".navigation"),
  },
  /**
   * Data acts sort of like a store.
   * It's a primitive way of having a single source of truth, so that all 
   * "global" variables will only exist in one place. Data has no defined
   * mutation methods, so data is just directly modified.
   */
  data: {
    currentUser: undefined, // <- will be set after request
    products: {
      visible: undefined, // <- will be set when filtering products
      all: undefined, // <- will be set after request
      sorting: "none" // <- Can be "ascending", "descending" and "none". Used when rendering products
    },
    users: {
      all: undefined
    },
    requests: []
  },

  /*************************
   NAVIGATION AND INTERFACE
  *************************/
  goTo: function(pageId) {
    console.log("goTo('"+pageId+"')")
    this.hideAllPages();
    var newPage = document.querySelector('[data-page-id="'+pageId+'"]')
    newPage.classList.add("active");
  },
  hideAllPages: function() {
    // var pages is not really needed. It's there to make the code prettier
    for (var i = 0; i < this.els.pages.length; i++) {
      this.els.pages[i].classList.remove("active");
    }
  },
  updatePageNavigation: function() {
    var pageLinks = document.querySelectorAll(".page-link");
    for (var i = 0; i < pageLinks.length; i++) {
      pageLinks[i].addEventListener("click", function() {
        var pageLinkId = this.getAttribute("data-go-to-page");
        if (pageLinkId == "edit-user") {
          page.updateEditUserPage();
        }
        page.goTo(pageLinkId);
      });
    }
  },
  getPages: function(callback) {
    page.request({
      type: "GET",
      url: "api/get-pages.php",
      callback: handleResponse
    });
    function handleResponse(res) {
      masterContainer.innerHTML = res.markup;
      callback();
    }
  },
  getMenu: function(callback) {
    // Make request to api.
    // Api decides if user is logged in and thereby
    // which menu is relevant and returns that as 
    // a string
    page.request({
      type: "GET",
      url: "api/get-menu.php",
      callback: handleResponse
    });
    function handleResponse(res) {
      page.els.navigation.innerHTML = res.markup;
      if (callback) { 
        callback();
      }
    }
  },
  getInterface() {
    /**
     * NOTE: This function is a little verbose, and might do a little more than what is needed
     * but it makes it easier to handle all the updating by sort of getting a fresh interface
     * everytime a critical event happens (like sign-in, sign-out, sign-up, creating, editing and deleting
     * products and users).
     * 
     * It prioritizes in this way:
     * 1) Get and render the pages (html markup)
     * 2) Get and render the menu (html markup)
     * 
     * <First paint>
     * 
     * 2b) Get the products while the rest of the script continues (these doesn't have to be ready
     *     since they selv-initialize there functionality)
     * 3) Update all element-references from page.els 
     * 4) Assign event-listeneres and functionality to all the rendered buttons and elements
     * 5) Navigate to the product-page
     * 
     * <Page is usable>
     * 
     * 6) If the user is admin also get the users (this can happen in the back)
     */

    if (page.data.currentUser) {
      console.log("User is logged in. Getting pages...");

      page.getPages(waitForPages);
      function waitForPages() {
        console.log("Pages rendered. Getting menu...");
        page.getMenu(waitForMenu);
        page.getProducts();
      }
      function waitForMenu() {
        console.log("Menu rendered. Updating page.els to match with rendered pages and navigation...");
        page.updateEls(waitForEls);
      }
      function waitForEls() {
        console.log("Updated page.els and will now attach event-listeners for forms and navigation");
        page.attachFormEvents(); // This function can be re-called if something changes and you need to re-assign events      
        page.updatePageNavigation();
        page.goTo("view-products");
        if (page.data.currentUser == "admin") {
          console.log("User is admin. Getting all users...")
          page.getUsers();
        }
      }
    } else {
      console.log("User is not logged in. Getting pages...");      
      page.getPages(waitForPages);
      function waitForPages() {
        console.log("Pages rendered. Getting menu...");      
        page.getMenu(waitForMenu);
      }
      function waitForMenu() {
        console.log("Menu rendered. Updating els...");      
        page.updateEls(waitForEls);
      }
      function waitForEls() {
        console.log("Els updated. Attaching eventlistener...");      
        page.attachFormEvents(); // This function can be re-called if something changes and you need to re-assign events      
        page.updatePageNavigation();
        page.goTo("landing-page");
      }
    }
  },
  updateEls: function(callback) {
    this.els.masterContainer = document.querySelector("#master-container");
    this.els.pages = document.querySelectorAll(".page");
    this.els.navigation = document.querySelector(".navigation");
    callback();
  },

  /**********************
   USERS
  **********************/
  // Sign in
  signIn: function() {
    page.request({
      type: "POST",
      url: "api/sign-in.php",
      form: frmLogIn,
      callback: handleResponse
    });
    function handleResponse(res) {
      if (res.login == "ok") {
        page.data.currentUser = res.user;
        page.getInterface();
        page.clearForm(frmLogIn);
      } else {
        page.activateMessage(txtLoginStatus);
      }
    }
  },
  signUp: function() {
    page.request({
      type: "POST",
      url: "api/add-user.php",
      form: frmSignUp,
      callback: handleResponse
    });
    function handleResponse(res) {
      if (res.message == "succes") {
        page.data.currentUser = res.user;
        page.getInterface();
        page.clearForm(frmSignUp);
      }
    }
  },
  signOut: function() {
    page.request({
      type: "GET",
      url: "api/sign-out.php",
      callback: handleResponse
    });
    function handleResponse() {
      page.data.currentUser = undefined;
      page.getInterface();
    }
  },
  editUser: function(e) {
    var jUserData = new FormData(frmEditUser);
    var sUserId = document.querySelector(".page.active .user").getAttribute("data-user-id");
    jUserData.append("txtId", sUserId);
    
    page.request({
      type: "POST",
      url: "api/edit-user.php",
      data: jUserData,
      callback: handleResponse
    });
    function handleResponse(res) {
      console.log(res);
      page.activateMessage(txtEditUserMessage);
      page.getMenu();
      page.getProducts();
      
      if (page.data.currentUser.role == "admin") {
        page.getUsers();
      } else {
        page.data.currentUser = res.user;
      }
    }
  },
  updateEditUserPage: function(userId) {
    /* A admin has asked to edit a user that isn't the admin itself */
    if (this.data.currentUser.role == "admin" && userId) {
      for (var i = 0; i < this.data.users.all.length; i++) {
        console.log("looping through users");
        if (this.data.users.all[i].id == userId) {
          var user = this.data.users.all[i];
        }   
      }
    /* Any type of user have asked to edit themselves */
    } else {
      var user = this.data.currentUser;
    }
    
    var elFirstName = document.querySelectorAll('[data-page-id="edit-user"] [name="txtFirstName"]')[0];
    var elLastName = document.querySelectorAll('[data-page-id="edit-user"] [name="txtLastName"]')[0];
    var elPhone = document.querySelectorAll('[data-page-id="edit-user"] [name="txtPhone"]')[0];
    var elEmail = document.querySelectorAll('[data-page-id="edit-user"] [name="txtEmail"]')[0];
    elFirstName.value = user.firstName;
    elLastName.value = user.lastName;
    elPhone.value = user.phone;
    elEmail.value = user.email;

    var htmlUser = '\
      <div class="user u_mb-xxl" data-user-id="'+user.id+'">\
        <div class="profile-picture" style="background-image: url(images/profile-pictures/'+user.profilePicture+')">\
        </div>\
        <div class="info">\
          <p class="name">'+user.firstName+' '+user.lastName+'</p>\
          <p class="phone">'+user.phone+'</p>\
          <p class="email">'+user.email+'</p>\
          <p class="role">'+user.role+'</p>\
        </div>\
      </div>'
    displayCurrentUserData.innerHTML = htmlUser;
  },
  deleteUser: function() {
    page.request({
      type: "GET",
      url: "api/delete-user.php",
      callback: handleResponse
    });
    function handleResponse(res) {
      page.data.currentUser = undefined;
      page.getMenu();
      page.getProducts();
      page.goTo("landing-page");
      //page.activateMessage(txtEditUserMessage);
    }
  },
  getUsers: function() {
    page.request({
      type: "GET",
      url: "api/get-users.php",
      callback: handleResponse
    });
    function handleResponse(res) {
      page.data.users.all = res;
      page.renderUsers();
    }
  },
  renderUsers: function() {
    var htmlUsers = "";
    var users = page.data.users.all;
    for (var i = 0; i < users.length; i++) {
      // Dont render the admin user itself
      if (users[i].id !== page.data.currentUser.id) {
        htmlUsers += '\
        <div class="user">\
          <div class="profile-picture" style="background-image: url(images/profile-pictures/'+users[i].profilePicture+')">\
          </div>\
          <div class="info">\
            <p class="name">'+users[i].firstName+' '+users[i].lastName+'</p>\
            <p class="phone">'+users[i].phone+'</p>\
            <p class="email">'+users[i].email+'</p>\
            <p class="role">'+users[i].role+'</p>\
          </div>\
          <div class="dropdown">\
            <div class="title">\
              <i class="material-icons">more_vert</i>\
            </div>\
            <div class="content">\
              <a class="btnAdminEditUser" data-user-id="'+users[i].id+'"><i class="material-icons">edit</i>Edit user</a>\
              <a class="btnAdminDeleteUser" data-user-id="'+users[i].id+'"><i class="material-icons">delete</i>Delete user</a>\
            </div>\
          </div>\
        </div>'
      }
    }
    usersContainer.innerHTML = htmlUsers;
    page.enableAdminUserEdit();
    page.enableAdminUserDelete();
  },
  enableAdminUserEdit: function() {
    console.log("X")
    var btnsEditUser = document.querySelectorAll(".btnAdminEditUser");
    for (var i = 0; i < btnsEditUser.length; i++) {
      btnsEditUser[i].addEventListener("click", function(e) {
        var currentElement = this;
        var currentElementContainer = page.getEl(e.path, "user");
        var sUserId = this.getAttribute("data-user-id");
        page.updateEditUserPage(sUserId);
        page.goTo("edit-user");
      });
    }
  },
  enableAdminUserDelete: function() {
    var btnsDeleteUser = document.querySelectorAll(".btnAdminDeleteUser");
    for (var i = 0; i < btnsDeleteUser.length; i++) {
      btnsDeleteUser[i].addEventListener("click", function(e) {
        var currentElement = this;
        var currentElementContainer = page.getEl(e.path, "user");
        /* console.log(this.getAttribute("data-user-id")); */
        var sUserId = this.getAttribute("data-user-id");
        var frmData = new FormData();
        frmData.append("sUserId", sUserId);

        page.request({
          type: "POST",
          url: "api/delete-user.php",
          data: frmData,
          callback: function(res) {
            currentElementContainer.classList.add("deleted");
          }
        });
      });
    }
  },
  IsUserSignedIn: function() {
    page.request({
      type: "GET",
      url: "api/is-user-signed-in.php",
      callback: function(res) {
        page.data.currentUser = res.user;
        page.getInterface();
      },
    });
  },

  /**********************
   PRODUCTS
  **********************/
  addProduct: function() {
    //page.activateSpinner();
    page.activateMessage
    page.request({
      type: "POST",
      url: "api/add-product.php",
      form: frmAddProduct,
      callback: function() {
        page.activateMessage(txtAddProductMessage);
        page.getProducts();
        page.clearForm(frmAddProduct);
      }
    });
  },
  editProduct: function() {
    page.request({
      type: "POST",
      url: "api/edit-product.php",
      form: frmEditProduct,
      callback: function(res) {
        page.getProducts();
        page.goTo("view-products");
      }
    });
  },
  deleteProduct: function() {
    page.request({
      type: "POST",
      url: "api/delete-product.php",
      form: frmEditProduct,
      callback: function(res) {
        page.getProducts();
        page.goTo("view-products");
        page.activateMessage(txtDeleteProductMessage);
      }
    });
  },
  getProducts: function() {
    page.request({
      type: "GET",
      url: "api/get-products.php",
      callback: function(products) {
        page.data.products.all = products;
        page.data.products.visible = products;
        page.renderProducts( initFiltersAndSorting );
        
        function initFiltersAndSorting() {
          /* This is close to becoming call-back hell but these functions
          adds some eventlisteners for dom-elements that aren't present 
          before the products have rendered. Therefor they will be called
          the first time the products are rendered (and only the first time).
          This is an effor to optimize code-efficiency and to eliminate
          multiple eventlisteners from being placed on buttons. (And i dont
          want to manually go and removeEventListener on every event and 
          re adding them)
          */
          console.log("Initing product filters and sorting.");
          page.enableProductFiltering();
          page.enableProductSorting();
        }
      }
    });

    

  },
  renderProducts: function( callback ) {
    console.log("Rendering products. Sorting: "+page.data.products.sorting)

    var sProducts = "";
    var products = page.data.products.visible;

    // If a sorting is defined sort the products the way it is defined
    // before render. Else dont sort the products by skipping this step
    if (page.data.products.sorting !== "none") {
      products = page.sortProducts(products, "price", page.data.products.sorting);
    }

    if (products.length) {  
      for (var i = 0; i<products.length; i++) {
        // If user owns product
        var sEditProduct = ""
        if ( page.data.currentUser.id == products[i].createdBy || 
             page.data.currentUser.role == "admin" // <- Im guessing this is a major security flaw, because anyone can just change this value frontend
        ) {
          var sEditProduct = '<a class="edit-product btnEditProductLink" data-product-id="'+products[i].id+'">Edit</a>'
        }
        // Rest of the product
        sProduct = '<div class="product">\
          '+sEditProduct+'\
          <div class="image" style="background-image: url(images/product-pictures/'+products[i].picture+')"></div>\
          <p class="title">'+products[i].name+'</p>\
          <p class="price">'+products[i].price+' DKK</p>\
        </div>';
        sProducts += sProduct;
      }
    } else {
      sProducts = "<p class='u-mlr-auto'>No products found...</p>";
    }
    productContainer.innerHTML = sProducts;
    page.updateEditProductLinks();

    txtVisibleProductStatus.innerText = "Showing "+products.length+" out of "+page.data.products.all.length+" products";

    // First time products are fetched a callback will be present.
    // The callback will create event-listeners for the filtering
    // and sorting
    if (callback) {
      callback();
    }
  },
  updateEditProductLinks: function() {
    /**
      * The edit-lnks that are dynamically placed on the products if a 
      * user owns the listed product.
      */
    var elEditProducts = document.querySelectorAll(".btnEditProductLink");
    for (var i = 0; i < elEditProducts.length; i++){
      elEditProducts[i].addEventListener("click", function() {
        var productId = this.getAttribute("data-product-id");
        page.updateEditProductForm(productId);
      });
    }
  },
  updateEditProductForm: function(productId) {
    /* 
      This should be refactored. Since all the needed data already exists inside
      the products array there is really no need for fetching the product.
      On the other hand, if a product were to have more data that could be edited
      than what is displayed this makes sense
    */
    page.activateSpinner();
    page.request({
      type: "GET",
      url: "api/get-product.php?productId="+productId,
      callback: handleResponse
    })
    function handleResponse(res) {
      // Update form values
      var elName = document.querySelectorAll('[data-page-id="edit-product"] [name="txtProductName"]')[0];
      var elPrice = document.querySelectorAll('[data-page-id="edit-product"] [name="txtProductPrice"]')[0];
      var elId = document.querySelectorAll('[data-page-id="edit-product"] [name="txtProductId"]')[0];
      elName.value = res.name;
      elPrice.value = res.price;
      elId.value = res.id;

      // Change navigation and disable spinner
      page.goTo("edit-product");
      page.deactivateSpinner();
      page.attachFormEvents();
    }
  },
  enableProductFiltering: function() {
    inputFilterProducts.addEventListener("keyup", page.filterProducts);
  },
  filterProducts: function(e) {
    clearTimeout(timeout);
    var timeout = setTimeout(function() {
      var sSearchString = e.target.value;
      var regEx = new RegExp(sSearchString, 'gi');
      var products = page.data.products.all;
      // Sets the visible products to null
      page.data.products.visible = [];
      for (var i = 0; i < products.length; i++) {
        if ( products[i].name.search(regEx) !== -1 && typeof products[i].name !== "null") {
          // Add products that match to the visible array
          page.data.products.visible.push( products[i] );
        }      
      }
      page.renderProducts();
    }, 100);
  },
  enableProductSorting: function() {
    btnSortAscending.addEventListener("click", function() {
      console.log("btnSortAscending");
      page.data.products.sorting = "ascending";
      btnSortAscending.classList.add("selected");
      btnSortDecending.classList.remove("selected");
      page.renderProducts();
    })
    btnSortDecending.addEventListener("click", function() {
      console.log("btnSortDescending");
      page.data.products.sorting = "descending";
      btnSortDecending.classList.add("selected");
      btnSortAscending.classList.remove("selected");
      page.renderProducts();
      
    })
  },
  sortProducts: function(arrayToSort, sortingKey, sortingWay) {
    arrayToSort.sort(function(a,b) {
    //page.data.products.visible.sort(function(a,b) {
      if (sortingWay == "ascending") {
        return a[sortingKey] - b[sortingKey]
      } else {
        return b[sortingKey] - a[sortingKey];
      }
    });
    return arrayToSort;
  },

  attachFormEvents: function() {
    /**
     * This is a bit stupid, but in order for the script
     * to not break, i cannot have a situation where a 
     * link isn't present. By doing a strict typechecking
     * of every button before assigining events i make
     * sure to not break the script if a button is missing
     * (which will happen with buttons that are dynamically
     * inserted). An alternative would be to break up fun
     */
    if (typeof btnSignUp !== "undefined") {
      btnSignUp.addEventListener("click", this.signUp);
    }
    if (typeof btnSignIn !== "undefined") {
      btnSignIn.addEventListener("click", this.signIn);
    }
    if (typeof btnSignOut !== "undefined") {
      btnSignOut.addEventListener("click", this.signOut);
    }
    if (typeof btnEditUser !== "undefined") {
      btnEditUser.addEventListener("click", this.editUser);
    }
    if (typeof btnDeleteUser !== "undefined") {
      btnDeleteUser.addEventListener("click", this.deleteUser);
    }
    if (typeof btnAddProduct !== "undefined") {
      btnAddProduct.addEventListener("click", this.addProduct);
    }
    if (typeof btnEditProduct !== "undefined") {
      btnEditProduct.addEventListener("click", this.editProduct);
    }
    if (typeof btnDeleteProduct !== "undefined") {
      btnDeleteProduct.addEventListener("click", this.deleteProduct);
    }
  },
  init: function() {
    this.IsUserSignedIn();
  },


  // Helpers
  request: function( options ) {
    /**
     * Expected options:
     * -------------------
     * type      <string>    
     * url       <string>    
     * form      <id/element>    
     * data      <form-encoded json>
     * callback  <function>
     * --------------------
     */ 

    // Activates spinner as soon as a request is made
    page.activateSpinner();
    
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // Manage request
        var iIndexOfRequest = page.data.requests.indexOf(request);
        page.data.requests.splice(iIndexOfRequest,1);      
        
        // Send data to caller
        var response = JSON.parse(this.response);
        options.callback(response);

        // If there are no active request, deactivate spinner
        if (page.data.requests.length == 0) {
          page.deactivateSpinner();
        }
      }
    }
    request.open( options.type, options.url, true );
    if (options.type == "POST" && options.form) {
      var jData = new FormData( options.form )
      request.send(jData);
    } else if ( options.type == "POST" && options.data) {
      request.send(options.data);
    } else {
      request.send();
      // Manage requests
      page.data.requests.push(request);
    }

  },
  activateMessage(id) {
    id.classList.add("active");
    setTimeout(function(){
      id.classList.remove("active");
    },10000)
  },
  activateSpinner: function() {
    spinner.classList.add("active");
  },
  deactivateSpinner: function() {
    spinner.classList.remove("active");
  },
  getEl: function(searchList, searchWord) {
    for (var i = 0; i < searchList.length; i++) {
      if (searchList[i].classList.contains(searchWord)) {
        return searchList[i];
      }
    }
  },
  clearForm: function(form) {
    for (var i = 0; i < form.children.length; i++) {
      form.children[i].value = "";
    }
  }
}
page.init();