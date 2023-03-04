console.log("inside password validator");
const regPassword= document.querySelector('#changeProfilePass');
const oldPassword = regPassword.querySelector('#oldprofilePassword');
const newPassword = regPassword.querySelector('#newprofilePassword');
const CnewPassword = regPassword.querySelector('#confirmnewprofilePassword');
const errorElementPassword = regPassword.querySelector('#alertprofilepassword')

function hideErrorMessagePass() {
  errorElementPassword.innerHTML = "";
}
function showErrorMessagePass(message) {

  errorElementPassword.innerHTML = `<div class="alert text-danger " role="alert">${message}</div>`
  setTimeout(() => {
    errorElementPassword.innerHTML = `<div></div>`
  }, 5000);

}

function Submitform() {
  


  let numberRegex = /\d/;
  let letterRegex = /[a-zA-Z]/;
  let specialCharRegex = /[@#$!%*?&]/;



  if (oldPassword.value.trim() === "") {

    showErrorMessagePass("Old Password is Required");
    console.log("here");
    return false;
  }

  if (newPassword.value.trim() === "") {

    showErrorMessagePass("Password is Required");
    return false;
  }




  if (newPassword.value.length < 6) {

    showErrorMessagePass("Password must be greater than 6 Characters");
    return false;
  }
  if (newPassword.value.length >= 15) {

    showErrorMessagePass("Password must be less than 15 Characters");
    return false;
  }
  if (!numberRegex.test(newPassword.value)) {

    showErrorMessagePass("Password must contain at least one number");
    return false;
  }
  if (!letterRegex.test(newPassword.value)) {

    showErrorMessagePass("Password must contain at least one letter");
    return false;
  }
  if (!specialCharRegex.test(newPassword.value)) {

    showErrorMessagePass("Password must contain at least one special character");
    return false;
  }






  if (CnewPassword.value.trim() === "") {

    showErrorMessage("Confirm your Password");
    return false;
  }
  if (newPassword.value != CnewPassword.value) {

    showErrorMessage("Passwords does not match");
    return false;
  }


  hideErrorMessagePass();
  return true;

}






