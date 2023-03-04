const reg = document.querySelector('#PermanentAddressform');
const fullname = reg.querySelector('#Pfullname');
const phone = reg.querySelector('#Pphone');
const housename = reg.querySelector('#Phousename');
const area = reg.querySelector('#Parea');
const landmark = reg.querySelector('#Plandmark');
const district = reg.querySelector('#Pdistrict');
const state = reg.querySelector('#Pstate');
const postoffice = reg.querySelector('#Ppostoffice');
const pin = reg.querySelector('#Ppin');


const errorElement = reg.querySelector('#alertPermanentAddress')

function hideErrorMessage() {
    errorElement.innerHTML = "";
}
function showErrorMessage(message) {

    errorElement.innerHTML = `<div class="alert text-danger " role="alert">${message}</div>`
    setTimeout(() => {
        errorElement.innerHTML = `<div></div>`
    }, 5000);

}

function submitform() {

    if (fullname.value.trim() === "") {

        showErrorMessage("Name  is Required");
        return false;
    }

    if (housename.value.trim() === "") {

        showErrorMessage("Housename is Required");
        return false;
    }
    if (isNaN(phone.value.trim())) {

        showErrorMessage("Phone Number should be digits");
        return false;
    }
    if (phone.value.length>10) {
        showErrorMessage("Incorrect Phone Number");
        return false;
    }
    if(phone.value.trim()==""){
        showErrorMessage("Phone Number is Empty");
        return false;
    }
    if(phone.value.length <10){
        showErrorMessage("Phone Number must be 10 numbers");
        return false;
    }


    if (area.value.trim() === "") {

        showErrorMessage("Area is Required");
        return false;
    }
    if (landmark.value.trim() === "") {

        showErrorMessage("Landmark is Required");
        return false;
    }
    if (district.value.trim() === "") {

        showErrorMessage("District is Required");
        return false;
    }
    if (state.value.trim() === "") {

        showErrorMessage("State is Required");
        return false;
    }
    if (postoffice.value.trim() === "") {

        showErrorMessage("Postoffice is Required");
        return false;
    }
    if (pin.value.trim() === "") {

        showErrorMessage("Pin Number is Required");
        return false;
    }
    if (pin.value.trim() == 6) {

        showErrorMessage("Pin Number should be 6");
        return false;
    }
    if (pin.value <= 099999) {

        showErrorMessage("Incorrect Pin Code");
        return false;
    }





    hideErrorMessage();
    return true;

}