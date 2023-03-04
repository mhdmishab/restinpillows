const chkregAddress = document.querySelector('#checkoutaddAddressform');
const chkaddAddresshousename = chkregAddress.querySelector('#checkoutaddhousename');
const chkaddAddressarea = chkregAddress.querySelector('#checkoutaddarea');
const chkaddAddresslandmark = chkregAddress.querySelector('#checkoutaddlandmark');
const chkaddAddressdistrict = chkregAddress.querySelector('#checkoutadddistrict');
const chkaddAddressstate = chkregAddress.querySelector('#checkoutaddstate');
const chkaddAddresspostoffice = chkregAddress.querySelector('#checkoutaddpostoffice');
const chkaddAddresspin = chkregAddress.querySelector('#checkoutaddpin');


const chkaddAddresserrorElement = chkregAddress.querySelector('#alertaddaddresscheckout')

function chkhideErrorMessage() {
    chkaddAddresserrorElement.innerHTML = "";
}
function chkshowErrorMessage(message) {

    chkaddAddresserrorElement.innerHTML = `<div class="alert text-danger " role="alert">${message}</div>`
    setTimeout(() => {
        chkaddAddresserrorElement.innerHTML = `<div></div>`
    }, 5000);

}

function chkaddsubmitform() {

    

    if (chkaddAddresshousename.value.trim() === "") {

        chkshowErrorMessage("Housename is Required");
        return false;
    }
    if (!isNaN(chkaddAddresshousename.value.trim())) {

        chkshowErrorMessage("Housename should be a string");
        return false;
    }


    if (chkaddAddressarea.value.trim() === "") {

        chkshowErrorMessage("Area is Required");
        return false;
    }
    if (!isNaN(chkaddAddressarea.value.trim())) {

        chkshowErrorMessage("Area should be a string");
        return false;
    }

    if (chkaddAddresslandmark.value.trim() === "") {

        chkshowErrorMessage("Landmark is Required");
        return false;
    }
    if (!isNaN(chkaddAddresslandmark.value.trim())) {

        chkshowErrorMessage("Landmark should be a string");
        return false;
    }

    if (chkaddAddressdistrict.value.trim() === "") {

        chkshowErrorMessage("District is Required");
        return false;
    }
    if (!isNaN(chkaddAddressdistrict.value.trim())) {

        chkshowErrorMessage("District should be a string");
        return false;
    }

    if (chkaddAddressstate.value.trim() === "") {

        chkshowErrorMessage("State is Required");
        return false;
    }
    if (!isNaN(chkaddAddressstate.value.trim())) {

        chkshowErrorMessage("State should be a string");
        return false;
    }

    if (chkaddAddresspostoffice.value.trim() === "") {

        chkshowErrorMessage("Postoffice is Required");
        return false;
    }
    if (!isNaN(chkaddAddresspostoffice.value.trim())) {

        chkshowErrorMessage("Postoffice should be a string");
        return false;
    }

    if (chkaddAddresspin.value.trim() === "") {

        chkshowErrorMessage("Pin Number is Required");
        return false;
    }
    if (chkaddAddresspin.value.length != 6) {

        chkshowErrorMessage("Pin Number should be 6");
        return false;
    }
    if (isNaN(chkaddAddresspin.value.trim())) {

        chkshowErrorMessage("Pin should be a Number");
        return false;
    }





    chkhideErrorMessage();
    return true;

}