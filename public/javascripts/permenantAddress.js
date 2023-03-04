const regPermanent = document.querySelector('#PermanentAddressform');
const fullnamePermanent = regPermanent.querySelector('#Pfullname');
const phonePermanent = regPermanent.querySelector('#Pphone');
const housenamePermanent = regPermanent.querySelector('#Phousename');
const areaPermanent = regPermanent.querySelector('#Parea');
const landmarkPermanent = regPermanent.querySelector('#Plandmark');
const districtPermanent = regPermanent.querySelector('#Pdistrict');
const statePermanent = regPermanent.querySelector('#Pstate');
const postofficePermanent = regPermanent.querySelector('#Ppostoffice');
const pinPermanent = regPermanent.querySelector('#Ppin');


const errorElementPermanent = regPermanent.querySelector('#alertPermanentAddress')

function hideErrorMessage() {
    errorElementPermanent.innerHTML = "";
}
function showErrorMessage(message) {

    errorElementPermanent.innerHTML = `<div class="alert text-danger " role="alert">${message}</div>`
    setTimeout(() => {
        errorElementPermanent.innerHTML = `<div></div>`
    }, 5000);

}

function submitform() {

    if (fullnamePermanent.value.trim() === "") {

        showErrorMessage("Name  is Required");
        return false;
    }

    if (housenamePermanent.value.trim() === "") {

        showErrorMessage("Housename is Required");
        return false;
    }
    if (!isNaN(housenamePermanent.value.trim())) {

        showErrorMessage("Housename should be a string");
        return false;
    }
    if (isNaN(phonePermanent.value.trim())) {

        showErrorMessage("Phone Number should be digits");
        return false;
    }
    if (phonePermanent.value.length>10) {
        showErrorMessage("Incorrect Phone Number");
        return false;
    }
    if(phonePermanent.value.trim()==""){
        showErrorMessage("Phone Number is Empty");
        return false;
    }
    if(phonePermanent.value.length <10){
        showErrorMessage("Phone Number must be 10 numbers");
        return false;
    }


    if (areaPermanent.value.trim() === "") {

        showErrorMessage("Area is Required");
        return false;
    }
    if (!isNaN(areaPermanent.value.trim())) {

        showErrorMessage("Area should be a string");
        return false;
    }
    if (landmarkPermanent.value.trim() === "") {

        showErrorMessage("Landmark is Required");
        return false;
    }
    if (!isNaN(landmarkPermanent.value.trim())) {

        showErrorMessage("Landmark should be a string");
        return false;
    }
    if (districtPermanent.value.trim() === "") {

        showErrorMessage("District is Required");
        return false;
    }
    if (!isNaN(districtPermanent.value.trim())) {

        showErrorMessage("District should be a string");
        return false;
    }
    if (statePermanent.value.trim() === "") {

        showErrorMessage("State is Required");
        return false;
    }
    if (!isNaN(statePermanent.value.trim())) {

        showErrorMessage("State should be a string");
        return false;
    }
    if (postofficePermanent.value.trim() === "") {

        showErrorMessage("Postoffice is Required");
        return false;
    }
    if (!isNaN(postofficePermanent.value.trim())) {

        showErrorMessage("Postoffice should be a string");
        return false;
    }
    if (pinPermanent.value.trim() === "") {

        showErrorMessage("Pin Number is Required");
        return false;
    }
    if (isNaN(pinPermanent.value.trim())) {

        showErrorMessage("Pin should be a Number");
        return false;
    }
    
    if (pinPermanent.value.length !=6) {

        showErrorMessage("Invalid Pin Code");
        return false;
    }





    hideErrorMessage();
    return true;

}