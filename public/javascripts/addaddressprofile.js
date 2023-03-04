const regAddress = document.querySelector('#addAddressform');
const addAddresshousename = regAddress.querySelector('#addhousename');
const addAddressarea = regAddress.querySelector('#addarea');
const addAddresslandmark = regAddress.querySelector('#addlandmark');
const addAddressdistrict = regAddress.querySelector('#adddistrict');
const addAddressstate = regAddress.querySelector('#addstate');
const addAddresspostoffice = regAddress.querySelector('#addpostoffice');
const addAddresspin = regAddress.querySelector('#addpin');


const addAddresserrorElement = regAddress.querySelector('#alertaddaddressprofile')

function addhideErrorMessage() {
    addAddresserrorElement.innerHTML = "";
}
function addshowErrorMessage(message) {

    addAddresserrorElement.innerHTML = `<div class="alert text-danger " role="alert">${message}</div>`
    setTimeout(() => {
        addAddresserrorElement.innerHTML = `<div></div>`
    }, 5000);

}

function addsubmitform(e) {

    

    if (addAddresshousename.value.trim() === "") {

        addshowErrorMessage("Housename is Required");
        return false;
    }
    if (!isNaN(addAddresshousename.value.trim())) {

        addshowErrorMessage("Housename should be a string");
        return false;
    }
   


    if (addAddressarea.value.trim() === "") {

        addshowErrorMessage("Area is Required");
        return false;
    }
    if (!isNaN(addAddressarea.value.trim())) {

        addshowErrorMessage("Area should be a string");
        return false;
    }

    if (addAddresslandmark.value.trim() === "") {

        addshowErrorMessage("Landmark is Required");
        return false;
    }
    if (!isNaN(addAddresslandmark.value.trim())) {

        addshowErrorMessage("Landmark should be a string");
        return false;
    }

    if (addAddressdistrict.value.trim() === "") {

        addshowErrorMessage("District is Required");
        return false;
    }
    if (!isNaN(addAddressdistrict.value.trim())) {

        addshowErrorMessage("District should be a string");
        return false;
    }

    if (addAddressstate.value.trim() === "") {

        addshowErrorMessage("State is Required");
        return false;
    }
    if (!isNaN(addAddressstate.value.trim())) {

        addshowErrorMessage("State should be a string");
        return false;
    }

    if (addAddresspostoffice.value.trim() === "") {

        addshowErrorMessage("Postoffice is Required");
        return false;
    }
    if (!isNaN(addAddresspostoffice.value.trim())) {

        addshowErrorMessage("Postoffice should be a string");
        return false;
    }

    if (addAddresspin.value.trim() === "") {

        addshowErrorMessage("Pin Number is Required");
        return false;
    }
    if (addAddresspin.value.length != 6) {

        addshowErrorMessage("Invalid Pin Code");
        return false;
    }
    if (isNaN(addAddresspin.value.trim())) {

        addshowErrorMessage("Pin should be a Number");
        return false;
    }
    





    addhideErrorMessage();
    return true;

}